resource "aws_iam_policy" "secrets_manager_write_policy" {
  name        = "openvpn-secrets-write-policy"
  description = "Allows writing the OpenVPN secret"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = "secretsmanager:PutSecretValue"
        Effect   = "Allow"
        Resource = aws_secretsmanager_secret.openvpn.arn
      },
    ]
  })
}

resource "aws_iam_role" "openvpn" {
  name = "openvpn-server-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "attach_sm_policy" {
  role       = aws_iam_role.openvpn.name
  policy_arn = aws_iam_policy.secrets_manager_write_policy.arn
}

resource "aws_iam_instance_profile" "openvpn" {
  name = "OpenVPNInstanceProfile"
  role = aws_iam_role.openvpn.name
}
