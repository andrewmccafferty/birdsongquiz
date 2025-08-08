terraform {
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


