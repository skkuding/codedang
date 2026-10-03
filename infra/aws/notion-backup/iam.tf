resource "aws_iam_role" "provisioner" {
  name = "notion-backup-provisioner"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        AWS = "arn:aws:iam::${local.account_id}:user/${local.bootstrap_user_name}"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

data "aws_iam_policy_document" "provisioner" {
  statement {
    sid = "ManageNotionBackupBucket"
    actions = [
      "s3:CreateBucket",
      "s3:DeleteBucketPolicy",
      "s3:GetBucket*",
      "s3:GetEncryptionConfiguration",
      "s3:GetLifecycleConfiguration",
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:ListBucket",
      "s3:PutBucketOwnershipControls",
      "s3:PutBucketPolicy",
      "s3:PutBucketPublicAccessBlock",
      "s3:PutBucketTagging",
      "s3:PutBucketVersioning",
      "s3:PutEncryptionConfiguration",
      "s3:PutLifecycleConfiguration",
    ]
    resources = [
      "arn:aws:s3:::${local.bucket_name}",
      "arn:aws:s3:::${local.bucket_name}/*",
    ]
  }

  statement {
    sid = "UseTerraformState"
    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:PutObject",
    ]
    resources = [
      "arn:aws:s3:::codedang-tf-state/terraform/notion-backup.tfstate",
      "arn:aws:s3:::codedang-tf-state/terraform/notion-backup.tfstate.tflock",
    ]
  }

  statement {
    sid       = "ListTerraformState"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::codedang-tf-state"]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values   = ["terraform/notion-backup.tfstate*"]
    }
  }

  statement {
    sid       = "CreateNotionBackupKMSKey"
    actions   = ["kms:CreateKey"]
    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "aws:RequestTag/Service"
      values   = ["notion-backup"]
    }
  }

  statement {
    sid = "ManageNotionBackupKMSKey"
    actions = [
      "kms:DescribeKey",
      "kms:EnableKeyRotation",
      "kms:GetKeyPolicy",
      "kms:GetKeyRotationStatus",
      "kms:ListResourceTags",
      "kms:PutKeyPolicy",
      "kms:TagResource",
      "kms:UntagResource",
      "kms:UpdateKeyDescription",
    ]
    resources = [aws_kms_key.notion_backup.arn]
  }

  statement {
    sid = "ManageNotionBackupKMSAlias"
    actions = [
      "kms:CreateAlias",
      "kms:UpdateAlias",
    ]
    resources = [
      "arn:aws:kms:${local.region}:${local.account_id}:alias/notion-backup",
      aws_kms_key.notion_backup.arn,
    ]
  }

  statement {
    sid = "ManageNotionBackupIdentities"
    actions = [
      "iam:CreateAccessKey",
      "iam:CreateRole",
      "iam:CreateUser",
      "iam:DeleteAccessKey",
      "iam:DeleteRolePolicy",
      "iam:DeleteUserPolicy",
      "iam:GetRole",
      "iam:GetRolePolicy",
      "iam:GetUser",
      "iam:GetUserPolicy",
      "iam:ListAccessKeys",
      "iam:ListAttachedRolePolicies",
      "iam:ListAttachedUserPolicies",
      "iam:ListRolePolicies",
      "iam:ListUserPolicies",
      "iam:PutRolePolicy",
      "iam:PutUserPolicy",
      "iam:TagRole",
      "iam:TagUser",
      "iam:UntagRole",
      "iam:UntagUser",
      "iam:UpdateAssumeRolePolicy",
    ]
    resources = [
      "arn:aws:iam::${local.account_id}:role/notion-backup-provisioner",
      "arn:aws:iam::${local.account_id}:user/${local.bootstrap_user_name}",
      "arn:aws:iam::${local.account_id}:user/notion-backup-writer",
    ]
  }
}

resource "aws_iam_role_policy" "provisioner" {
  name   = "notion-backup-provisioner"
  role   = aws_iam_role.provisioner.id
  policy = data.aws_iam_policy_document.provisioner.json
}

resource "aws_iam_user_policy" "bootstrap_assume_provisioner" {
  name = "assume-notion-backup-provisioner"
  user = local.bootstrap_user_name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sts:AssumeRole"
      Resource = aws_iam_role.provisioner.arn
    }]
  })
}

resource "aws_iam_user" "writer" {
  name = "notion-backup-writer"
}

resource "aws_iam_access_key" "writer" {
  user = aws_iam_user.writer.name
}

data "aws_iam_policy_document" "writer" {
  statement {
    sid       = "GetBucketLocation"
    actions   = ["s3:GetBucketLocation"]
    resources = [aws_s3_bucket.notion_backup.arn]
  }

  statement {
    sid       = "ListBackupPrefix"
    actions   = ["s3:ListBucket", "s3:ListBucketMultipartUploads"]
    resources = [aws_s3_bucket.notion_backup.arn]

    condition {
      test     = "StringLike"
      variable = "s3:prefix"
      values = [
        local.object_prefix,
        "${local.object_prefix}/*",
      ]
    }
  }

  statement {
    sid = "ReadWriteBackupObjects"
    actions = [
      "s3:AbortMultipartUpload",
      "s3:GetObject",
      "s3:ListMultipartUploadParts",
      "s3:PutObject",
    ]
    resources = ["${aws_s3_bucket.notion_backup.arn}/${local.object_prefix}/*"]
  }

  statement {
    sid = "UseBackupKMSKey"
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey",
    ]
    resources = [aws_kms_key.notion_backup.arn]
  }
}

resource "aws_iam_user_policy" "writer" {
  name   = "notion-backup-writer"
  user   = aws_iam_user.writer.name
  policy = data.aws_iam_policy_document.writer.json
}
