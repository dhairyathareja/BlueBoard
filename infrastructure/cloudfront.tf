resource "aws_cloudfront_origin_access_control" "frontend_oac" {

  name        = "${local.name}-oac"
  description = "OAC for BlueBoard Frontend"

  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}


resource "aws_cloudfront_distribution" "frontend" {

  enabled             = true
  default_root_object = "index.html"

  # ============================================================
  # FRONTEND ORIGIN - S3
  # ============================================================

  origin {

    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name

    origin_id = "frontend-origin"

    origin_access_control_id = aws_cloudfront_origin_access_control.frontend_oac.id
  }


  # ============================================================
  # BACKEND ORIGIN - EC2
  # ============================================================

  origin {

    domain_name = aws_eip.backend_eip.public_dns

    origin_id = "backend-origin"

    custom_origin_config {

      http_port  = 80
      https_port = 443

      origin_protocol_policy = "http-only"

      origin_ssl_protocols = [
        "TLSv1.2"
      ]
    }
  }


  # ============================================================
  # DEFAULT BEHAVIOR
  #
  # Everything goes to S3 unless it matches an API path below.
  # ============================================================

  default_cache_behavior {

    allowed_methods = [
      "GET",
      "HEAD"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    target_origin_id = "frontend-origin"

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {

      query_string = false

      cookies {
        forward = "none"
      }
    }
  }


  # ============================================================
  # AUTH API
  # ============================================================

  ordered_cache_behavior {

    path_pattern     = "auth/*"
    target_origin_id = "backend-origin"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "POST",
      "PATCH",
      "DELETE"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {

      query_string = true

      cookies {
        forward = "all"
      }

      headers = [
        "Origin",
        "Access-Control-Request-Headers",
        "Access-Control-Request-Method"
      ]
    }
  }


  # ============================================================
  # EMPLOYEE API
  # ============================================================

  ordered_cache_behavior {

    path_pattern     = "employee/*"
    target_origin_id = "backend-origin"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "POST",
      "PATCH",
      "DELETE"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {

      query_string = true

      cookies {
        forward = "all"
      }

      headers = [
        "Origin",
        "Access-Control-Request-Headers",
        "Access-Control-Request-Method"
      ]
    }
  }


  # ============================================================
  # ROLE API
  # ============================================================

  ordered_cache_behavior {

    path_pattern     = "role/*"
    target_origin_id = "backend-origin"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "POST",
      "PATCH",
      "DELETE"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {

      query_string = true

      cookies {
        forward = "all"
      }

      headers = [
        "Origin",
        "Access-Control-Request-Headers",
        "Access-Control-Request-Method"
      ]
    }
  }


  # ============================================================
  # AWS PROFILE API
  # ============================================================

  ordered_cache_behavior {

    path_pattern     = "awsProfile/*"
    target_origin_id = "backend-origin"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "POST",
      "PATCH",
      "DELETE"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {

      query_string = true

      cookies {
        forward = "all"
      }

      headers = [
        "Origin",
        "Access-Control-Request-Headers",
        "Access-Control-Request-Method"
      ]
    }
  }


  # ============================================================
  # DOCUMENT API
  # ============================================================

  ordered_cache_behavior {

    path_pattern     = "document/*"
    target_origin_id = "backend-origin"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
      "PUT",
      "POST",
      "PATCH",
      "DELETE"
    ]

    cached_methods = [
      "GET",
      "HEAD"
    ]

    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {

      query_string = true

      cookies {
        forward = "all"
      }

      headers = [
        "Origin",
        "Access-Control-Request-Headers",
        "Access-Control-Request-Method"
      ]
    }
  }


  # ============================================================
  # RESTRICTIONS
  # ============================================================

  restrictions {

    geo_restriction {
      restriction_type = "none"
    }
  }


  # ============================================================
  # HTTPS
  # ============================================================

  viewer_certificate {

    cloudfront_default_certificate = true
  }
}