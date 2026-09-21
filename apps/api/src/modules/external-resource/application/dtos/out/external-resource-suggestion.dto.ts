import { ApiProperty } from '@nestjs/swagger';
import type { ExternalResourceSuggestion } from '@/modules/external-resource/domain/external-resource-suggestion';

export class ExternalResourceSuggestionDTO {
  @ApiProperty() id!: string;
  @ApiProperty({ nullable: true }) acceptedExternalResourceId!: string | null;
  @ApiProperty({ nullable: true }) submittedByAccountId!: string | null;
  @ApiProperty() url!: string;
  @ApiProperty() status!: string;
  @ApiProperty({ nullable: true }) decisionNote!: string | null;
  @ApiProperty({ nullable: true }) decidedByAccountId!: string | null;
  @ApiProperty({ nullable: true }) decidedAt!: string | null;
  @ApiProperty() createdAt!: string;
}

export function toExternalResourceSuggestionDTO(suggestion: ExternalResourceSuggestion): ExternalResourceSuggestionDTO {
  return {
    id: suggestion.id,
    acceptedExternalResourceId: suggestion.acceptedExternalResourceId,
    submittedByAccountId: suggestion.submittedByAccountId,
    url: suggestion.url,
    status: suggestion.status,
    decisionNote: suggestion.decisionNote,
    decidedByAccountId: suggestion.decidedByAccountId,
    decidedAt: suggestion.decidedAt,
    createdAt: suggestion.createdAt,
  };
}
