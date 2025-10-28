terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = var.backend_bucket
    key = "terraform.tfstate"
    region = var.region
  }
}

variable "backend_bucket" {
  description = "The name of the AWS S3 bucket to use as the terraform backend (where terraform's information will be stored)"
  type = string
}

variable "region" {
  description = "AWS region to use"
  type = string
}

variable "availability_zone" {
  description = "AWS availability zone to use"
  type = string
}

variable "ssh_key" {
  description = "The SSH public key to add to the server"
  type = string
}

provider "aws" {
  region = var.region
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnet" "default" {
  vpc_id            = data.aws_vpc.default.id
  availability_zone = var.availability_zone
  default_for_az    = true
}

resource "aws_security_group" "complaint_generator_sg" {
  name_prefix = "complaint-generator-sg-"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "debian" {
  most_recent = true
  owners = ["amazon"]
  filter {
    name   = "name"
    values = ["debian-13-arm64*"]
  }
}

# Create EC2 instance
resource "aws_instance" "complaint_generator" {
  ami                    = data.aws_ami.debian.id
  instance_type          = "t4g.micro"
  vpc_security_group_ids = [aws_security_group.complaint_generator_sg.id]
  subnet_id              = data.aws_subnet.default.id

  key_name = aws_key_pair.key.key_name

  user_data = <<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y docker.io
  EOF

  user_data_replace_on_change = true

  tags = {
    Name = "complaint-generator"
  }
}

resource "aws_eip" "ip" {
    instance = aws_instance.complaint_generator.id
    domain = "vpc"
}

resource "aws_key_pair" "key" {
    key_name = "ssh-key"
    public_key = var.ssh_key
}