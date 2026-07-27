resource "aws_instance" "backend" {

  ami = data.aws_ami.ubuntu.id

  instance_type = var.instance_type

  key_name = var.key_pair_name

  subnet_id = aws_subnet.public_subnet.id

  vpc_security_group_ids = [
    aws_security_group.blueboard_sg.id
  ]

  iam_instance_profile = aws_iam_instance_profile.blueboard_profile.name

  user_data_replace_on_change = true

  user_data = file("${path.module}/userdata/install.sh")

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-backend"
    }
  )

}