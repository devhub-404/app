import { ApiHideProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateCommentReportDTO } from './create-comment-report.dto';
import { CreateResourceReportDTO } from './create-resource-report.dto';

export class CreateResourceReportInputDTO extends CreateResourceReportDTO {
  @ApiHideProperty() @IsString() accountId!: string;
  @ApiHideProperty() @IsString() resourceId!: string;
}

export class CreateCommentReportInputDTO extends CreateCommentReportDTO {
  @ApiHideProperty() @IsString() accountId!: string;
  @ApiHideProperty() @IsString() commentId!: string;
}
