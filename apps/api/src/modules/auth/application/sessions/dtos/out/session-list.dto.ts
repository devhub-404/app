import { ApiProperty } from '@nestjs/swagger';
import { SessionDTO } from '@/modules/auth/application/sessions/dtos/out/session.dto';

export class SessionListDTO {
  @ApiProperty({ type: () => [SessionDTO] })
  items!: SessionDTO[];
}
