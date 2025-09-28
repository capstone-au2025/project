from argparse import ArgumentParser
from pathlib import Path
from dataclasses import dataclass
from datetime import datetime
from dateutil.parser import isoparse
from typing import Any, Literal
import json
import re

import matplotlib.pyplot as plt


@dataclass
class Card:
    id: str
    name: str
    creation_time: datetime
    completion_time: datetime | None
    story_points: int
    closed: bool


def is_completion_action(action: Any):
    if action["type"] != "updateCard":
        return False
    if "listBefore" not in action["data"]:
        return False
    if "listAfter" not in action["data"]:
        return False
    if "done" not in action["data"]["listAfter"]["name"].lower():
        return False
    return True


def get_story_points(label_dict: dict[str, str], card: Any):
    label_ids = card.get("idLabels", [])
    label_names = [label_dict[label_id] for label_id in label_ids]
    for label_name in label_names:
        if match := re.match(r"Story Points: (\d+)", label_name):
            return int(match[1])
        if match := re.match(r"(\d+) SP", label_name):
            return int(match[1])
    return 0


def parse_cards(trello_export: Path) -> list[Card]:
    data = json.loads(trello_export.read_text())

    labels: dict[str, str] = {label["id"]: label["name"] for label in data["labels"]}
    actions = data["actions"]

    cards: dict[str, Card] = {}

    # actions is stored in reverse chronological order
    for action in actions[::-1]:
        if action["type"] == "createCard":
            id = action["data"]["card"]["id"]
            name = action["data"]["card"]["name"]
            date = isoparse(action["date"])
            cards[id] = Card(
                id=id,
                name=name,
                creation_time=date,
                completion_time=None,
                story_points=0,
                closed=False,
            )
        if action["type"] == "updateCard":
            id = action["data"]["card"]["id"]
            name = action["data"]["card"]["name"]
            closed = action["data"]["card"].get("closed", False)
            if id in cards and "idLabels" in action["data"]["card"]:
                cards[id].name = name
                cards[id].story_points = get_story_points(
                    labels, action["data"]["card"]
                )
                cards[id].closed = closed
        if is_completion_action(action):
            id = action["data"]["card"]["id"]
            date = isoparse(action["date"])
            cards[id].completion_time = date

    completed_cards = [card for card in cards.values() if card.completion_time]
    print("Completed cards")
    completed_cards.sort(key=lambda card: card.completion_time)  # type: ignore
    print("=" * (max(len(x.name) for x in completed_cards) + 10))
    for card in completed_cards:
        assert card.completion_time
        print(
            f"{card.completion_time.strftime('%m/%d')} {card.story_points:2}  {card.name}"
        )
    print()

    return [card for card in cards.values() if not card.closed and card.story_points]


@dataclass(order=True)
class Event:
    time: datetime
    card: Card
    type: Literal["create", "complete"]


def main():
    start = datetime(2025, 9, 15)
    end = datetime(2025, 11, 26)
    break_start = datetime(2025, 10, 16)
    break_end = datetime(2025, 10, 19)

    parser = ArgumentParser()
    parser.add_argument("trello_export", type=Path)
    parser.add_argument("--out", "-o", type=Path, required=True)
    parser.add_argument("--story-points", "-s", type=int, required=True)
    parser.add_argument("--title", "-t", type=str, default="Burnup Chart")
    args = parser.parse_args()

    total_scope = args.story_points

    cards = parse_cards(args.trello_export)

    events: list[Event] = []
    for card in cards:
        events.append(Event(card.creation_time, card, "create"))
        if card.completion_time:
            events.append(Event(card.completion_time, card, "complete"))
    events.sort()

    assert events

    def date_to_day(time: datetime):
        return (datetime(time.year, time.month, time.day) - start).days

    start_day = 0
    end_day = date_to_day(end)

    break_start_day = date_to_day(break_start)
    break_end_day = date_to_day(break_end)
    projected_x = [0, break_start_day, break_end_day, end_day]
    projected_slope = total_scope / end_day
    projected_y = [
        0,
        break_start_day * projected_slope,
        break_start_day * projected_slope,
        total_scope,
    ]

    completed_x = [0]
    completed_y = [0]

    for event in events:
        day = date_to_day(event.time)
        if event.type != "complete":
            continue
        story_points = event.card.story_points
        new_y = completed_y[-1] + story_points
        if completed_x[-1] == day:
            completed_y[-1] = new_y
        else:
            completed_x.append(day)
            completed_y.append(new_y)

    plt.figure(figsize=(8, 5))
    plt.plot(completed_x, completed_y, label="Actual")
    plt.axhline(total_scope, label="Scope", color="red", linestyle=":")
    plt.plot(projected_x, projected_y, label="Projected", color="green", linestyle="--")
    plt.title(args.title)
    plt.xlabel("Day")
    plt.ylabel("Story Points")
    plt.xticks(range(start_day, end_day + 1, 7))
    plt.legend()
    plt.grid(True, linestyle="--", alpha=0.6)
    plt.savefig(args.out)
    print(f"Wrote {args.out}")


if __name__ == "__main__":
    main()
