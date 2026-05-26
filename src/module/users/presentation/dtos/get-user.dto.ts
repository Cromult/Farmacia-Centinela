export class GetUserDto {
  id!: number;
  email!: string;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  static fromEntity(entity: any): GetUserDto {
    const dto = new GetUserDto();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.is_active = entity.is_active;
    dto.created_at = entity.created_at;
    dto.updated_at = entity.updated_at;
    return dto;
  }
}
