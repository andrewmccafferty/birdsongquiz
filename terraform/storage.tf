resource "aws_s3_bucket" "frontend_bucket" {
  bucket = var.environment == "prod" ? "birdsongquiz-frontend" : "birdsongquiz-frontend-${var.environment}"
}

resource "aws_s3_bucket" "species_list_bucket" {
  bucket = var.environment == "prod" ? "species-list-bucket" : "${var.environment}-species-list-bucket"
}

resource "aws_s3_bucket_ownership_controls" "species_list_bucket" {
  bucket = aws_s3_bucket.species_list_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "species_list_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.species_list_bucket]

  bucket = aws_s3_bucket.species_list_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = var.environment == "prod" ? "birdsongquiz-bucket" : "birdsongquiz-bucket-${var.environment}"
}

resource "aws_s3_bucket_ownership_controls" "lambda_bucket" {
  bucket = aws_s3_bucket.lambda_bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "lambda_bucket" {
  depends_on = [aws_s3_bucket_ownership_controls.lambda_bucket]

  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

