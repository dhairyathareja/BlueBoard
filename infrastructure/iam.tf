data "aws_iam_policy_document" "ec2_assume_role" {

  statement {

    effect = "Allow"

    principals {

      type = "Service"

      identifiers = ["ec2.amazonaws.com"]

    }

    actions = ["sts:AssumeRole"]

  }

}


resource "aws_iam_role" "blueboard_role" {

  name = "${local.name}-ec2-role"

  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = local.common_tags

}


resource "aws_iam_role_policy_attachment" "s3_access" {

  role = aws_iam_role.blueboard_role.name

  policy_arn = "arn:aws:iam::aws:policy/AmazonS3FullAccess"

}


resource "aws_iam_role_policy_attachment" "iam_access" {

  role = aws_iam_role.blueboard_role.name

  policy_arn = "arn:aws:iam::aws:policy/IAMFullAccess"

}


resource "aws_iam_role_policy" "ssm_parameter_access" {

  name = "${local.name}-ssm-parameter-access"

  role = aws_iam_role.blueboard_role.id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]

        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:parameter/blueboard/backend/env",
          "arn:aws:ssm:${var.aws_region}:*:parameter/blueboard/github/pat",
          "arn:aws:ssm:${var.aws_region}:*:parameter/blueboard/github/owner",
          "arn:aws:ssm:${var.aws_region}:*:parameter/blueboard/github/repo"
        ]
      }
    ]
  })
}



resource "aws_iam_instance_profile" "blueboard_profile" {

  name = "${local.name}-instance-profile"

  role = aws_iam_role.blueboard_role.name

}



