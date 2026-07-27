resource "aws_vpc" "blueboard_vpc" {

  cidr_block = var.vpc_cidr

  enable_dns_hostnames = true

  enable_dns_support = true

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-vpc"
    }
  )
}


resource "aws_subnet" "public_subnet" {

  vpc_id = aws_vpc.blueboard_vpc.id

  cidr_block = var.public_subnet_cidr

  availability_zone = var.availability_zone

  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-public-subnet"
    }
  )

}


resource "aws_internet_gateway" "igw" {

  vpc_id = aws_vpc.blueboard_vpc.id

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-igw"
    }
  )

}


resource "aws_route_table" "public_route_table" {

  vpc_id = aws_vpc.blueboard_vpc.id

  route {

    cidr_block = "0.0.0.0/0"

    gateway_id = aws_internet_gateway.igw.id

  }

  tags = merge(
    local.common_tags,
    {
      Name = "${local.name}-public-rt"
    }
  )

}


resource "aws_route_table_association" "public_association" {

  subnet_id = aws_subnet.public_subnet.id

  route_table_id = aws_route_table.public_route_table.id

}