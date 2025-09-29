package main

import (
	"fmt"
	"os"
	"os/exec"

	"github.com/landlock-lsm/go-landlock/landlock"
)

func main() {
	// BestEffort is used because Docker running on a non-linux host will not have
	// landlock support (see https://github.com/docker/roadmap/issues/835)

	// only allow Typst to access its binary and libc
	err := landlock.V5.BestEffort().RestrictPaths(
		landlock.ROFiles("/bin/typst", "/lib/ld-musl-x86_64.so.1"),
	)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	// prevent typst from opening network connections
	err = landlock.V5.BestEffort().RestrictNet()
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	// the passes in parameters in argv[1]
	cmd := exec.Command("typst", "compile", "-", "-", "--input=params="+string(os.Args[1]))

	// connect Typst's stdio to the wrapper's
	cmd.Stdin = os.Stdin
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err = cmd.Run()
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}
