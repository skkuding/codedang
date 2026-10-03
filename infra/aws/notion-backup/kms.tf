resource "aws_kms_key" "notion_backup" {
  description             = "Encrypts immutable Notion document backup objects"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_kms_alias" "notion_backup" {
  name          = "alias/notion-backup"
  target_key_id = aws_kms_key.notion_backup.key_id

  lifecycle {
    prevent_destroy = true
  }
}
