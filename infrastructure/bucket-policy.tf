
data "aws_iam_policy_document" "frontend_bucket_policy" {

  statement {

    actions = ["s3:GetObject"]

    resources = [

      "${aws_s3_bucket.frontend.arn}/*"

    ]

    principals {

      type = "Service"

      identifiers = [

        "cloudfront.amazonaws.com"

      ]

    }

    condition {

      test = "StringEquals"

      variable = "AWS:SourceArn"

      values = [

        aws_cloudfront_distribution.frontend.arn

      ]

    }

  }

}