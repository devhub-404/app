import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Role } from '@/shared/kernel/auth/role';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';
import { Public } from '@/shared/nest/decorators/public';
import { User } from '@/modules/auth/public/http';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import {
  CreateAnswerDTO,
  CreateQuestionDTO,
  ListQuestionsDTO,
  PaginatedQuestionsDTO,
  QuestionDTO,
  AnswerDTO,
  QAndAAccountContributionDTO,
} from '../application/dtos';
import { ListQuestionsQuery } from '../application/use-cases/query/list-questions.query';
import { ListMyQuestionsQuery, ListQuestionsForModerationQuery } from '../application/use-cases/query';
import { GetQuestionQuery } from '../application/use-cases/query/get-question.query';
import { CreateQuestionCommand } from '../application/use-cases/command/create-question.command';
import { CreateAnswerCommand } from '../application/use-cases/command/create-answer.command';
import {
  AcceptAnswerCommand,
  RemoveAcceptedAnswerCommand,
  CloseQuestionCommand,
  ReopenQuestionCommand,
  DeleteQuestionCommand,
  DeleteAnswerCommand,
} from '../application/use-cases/command';
@Controller('questions')
@UseGuards(AuthGuard, RoleGuard)
export class QAndAController {
  constructor(
    private readonly listQuestions: ListQuestionsQuery,
    private readonly getQuestion: GetQuestionQuery,
    private readonly createQuestion: CreateQuestionCommand,
    private readonly createAnswer: CreateAnswerCommand,
    private readonly acceptAnswer: AcceptAnswerCommand,
    private readonly removeAcceptedAnswer: RemoveAcceptedAnswerCommand,
    private readonly closeQuestion: CloseQuestionCommand,
    private readonly reopenQuestion: ReopenQuestionCommand,
    private readonly deleteQuestion: DeleteQuestionCommand,
    private readonly deleteAnswerCommand: DeleteAnswerCommand,
    private readonly myQuestions: ListMyQuestionsQuery,
    private readonly moderationQuestions: ListQuestionsForModerationQuery,
  ) {}
  @Version('1') @Get() @Public() @AppResponse('CONTENT_LISTED', PaginatedQuestionsDTO) list(
    @Query() q: ListQuestionsDTO,
  ) {
    return this.listQuestions.execute(q);
  }
  @Version('1') @Get('mine') @AppResponse('CONTENT_LISTED', QAndAAccountContributionDTO, { isArray: true }) listMine(
    @User('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.myQuestions.execute(userId, Number(limit || 20));
  }
  @Version('1')
  @Get('administration')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_LISTED', PaginatedQuestionsDTO)
  listForAdministration(@Query() q: ListQuestionsDTO) {
    return this.moderationQuestions.execute(q);
  }
  @Version('1') @Get(':id') @Public() @AppResponse('CONTENT_FETCHED', QuestionDTO) get(
    @User() user: AuthenticatedUser | null,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getQuestion.execute(id, user ?? undefined);
  }
  @Version('1') @Post() @AppResponse('CONTENT_CREATED', QuestionDTO) create(
    @User('id') u: string,
    @Body() b: CreateQuestionDTO,
  ) {
    return this.createQuestion.execute(u, b);
  }
  @Version('1') @Post(':id/answers') @AppResponse('CONTENT_CREATED', AnswerDTO) answer(
    @User('id') u: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() b: CreateAnswerDTO,
  ) {
    return this.createAnswer.execute(u, id, b);
  }
  @Version('1') @Put(':id/accepted-answer/:answerId') @AppResponse('CONTENT_UPDATED', QuestionDTO) accept(
    @User('id') u: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('answerId', ParseUUIDPipe) answerId: string,
  ) {
    return this.acceptAnswer.execute(u, id, answerId);
  }
  @Version('1') @Delete(':id/accepted-answer') @AppResponse('CONTENT_UPDATED', QuestionDTO) removeAccepted(
    @User('id') u: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.removeAcceptedAnswer.execute(u, id);
  }
  @Version('1') @Delete(':id') @AppResponse('CONTENT_DELETED') delete(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.deleteQuestion.execute(user, id);
  }
  @Version('1') @Delete(':id/answers/:answerId') @AppResponse('CONTENT_DELETED') deleteAnswer(
    @User() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('answerId', ParseUUIDPipe) answerId: string,
  ) {
    return this.deleteAnswerCommand.execute(user, id, answerId);
  }
  @Version('1')
  @Post(':id/close')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED', QuestionDTO)
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.closeQuestion.execute(id);
  }
  @Version('1')
  @Post(':id/reopen')
  @Roles([Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED', QuestionDTO)
  reopen(@Param('id', ParseUUIDPipe) id: string) {
    return this.reopenQuestion.execute(id);
  }
}
