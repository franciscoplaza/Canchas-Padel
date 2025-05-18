import { IsMongoId, IsNotEmpty, IsDateString, IsInt, Min } from 'class-validator';

export class CreateReservaDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly usuarioId: string;

  @IsMongoId()
  @IsNotEmpty()
  readonly canchaId: string;

  @IsDateString()
  @IsNotEmpty()
  readonly fechaHoraInicio: string;

  @IsInt()
  @Min(1)
  readonly duracionHoras: number;
}
