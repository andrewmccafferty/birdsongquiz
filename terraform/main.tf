terraform {
  required_version = "1.12.2"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.26.0"
    }
  }
  
  backend "s3" {
    bucket = "birdsongquiz-terraform-state-bucket"
    key    = "state/terraform.tfstate"
    region = "eu-west-2"
    dynamodb_table = null
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}


