resource "aws_iam_user" "letsencrypt" {
  name = "on-prem-letsencrypt"
  tags = {
    Description = "Lets Encrypt Cluster Issuer on on-premise k8s"
  }
}

resource "aws_iam_access_key" "letsencrypt" {
  user = aws_iam_user.letsencrypt.name
}

data "aws_route53_zone" "codedang" {
  name = "codedang.com"
}

data "aws_iam_policy_document" "letsencrypt_route53" {
  statement {
    actions   = ["route53:GetChange"]
    resources = ["arn:aws:route53:::change/*"]
  }

  statement {
    actions = [
      "route53:ChangeResourceRecordSets",
      "route53:ListResourceRecordSets"
    ]
    resources = ["arn:aws:route53:::hostedzone/${data.aws_route53_zone.codedang.id}"]
    condition {
      test     = "StringEquals"
      variable = "route53:ChangeResourceRecordSetsRecordTypes"
      values   = ["TXT"]
    }
  }

  statement {
    actions   = ["route53:ListHostedZonesByName"]
    resources = ["*"]
  }
}

resource "aws_iam_user_policy" "letsencrypt_route53" {
  name   = "letsencrypt-route53"
  user   = aws_iam_user.letsencrypt.name
  policy = data.aws_iam_policy_document.letsencrypt_route53.json
}
