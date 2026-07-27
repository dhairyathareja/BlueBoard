resource "aws_eip" "backend_eip" {

  domain = "vpc"

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-eip"
    }
  )

}


resource "aws_eip_association" "backend_eip_association" {

  instance_id = aws_instance.backend.id

  allocation_id = aws_eip.backend_eip.id

}