resource "aws_dynamodb_table" "species_preset_lists" {
    name         = "species_preset_lists"
    billing_mode = "PAY_PER_REQUEST"
    hash_key     = "preset_id"
    range_key = "region_id"
    attribute {
        name = "region_id"
        type = "S"
    }
    attribute {
        name = "preset_id"
        type = "S"
    }
}