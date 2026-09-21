import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard, User } from '@/modules/auth/public/http';
import { RoleGuard } from '@/shared/nest/guards/role.guard';
import { Roles } from '@/shared/nest/decorators/roles.decorator';
import { Role } from '@/shared/kernel/auth/role';
import { Public } from '@/shared/nest/decorators/public';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import {
  AcceptEventSuggestionDTO,
  CreateEventDTO,
  EventDTO,
  ListEventsDTO,
  PaginatedEventsDTO,
  RejectEventDTO,
  ReviewEventDTO,
  SubmitEventSuggestionDTO,
  UpdateEventDTO,
} from '../application/dtos';
import {
  AcceptEventSuggestionCommand,
  CreateEventCommand,
  DeleteEventCommand,
  GetEventByIdQuery,
  GetEventBySlugQuery,
  ListEventsForManagementQuery,
  ListEventsQuery,
  ListMyEventSuggestionsQuery,
  ListPendingEventSuggestionsQuery,
  RejectEventSuggestionCommand,
  ReviewEventCommand,
  SubmitEventSuggestionCommand,
  UpdateEventCommand,
} from '../application/use-cases';

@Controller('events')
@UseGuards(AuthGuard, RoleGuard)
export class EventController {
  constructor(
    private readonly listEventsQuery: ListEventsQuery,
    private readonly listEventsForManagementQuery: ListEventsForManagementQuery,
    private readonly getEventByIdQuery: GetEventByIdQuery,
    private readonly getEventBySlugQuery: GetEventBySlugQuery,
    private readonly createEventCommand: CreateEventCommand,
    private readonly updateEventCommand: UpdateEventCommand,
    private readonly deleteEventCommand: DeleteEventCommand,
    private readonly reviewEventCommand: ReviewEventCommand,
    private readonly submitSuggestion: SubmitEventSuggestionCommand,
    private readonly acceptSuggestion: AcceptEventSuggestionCommand,
    private readonly rejectSuggestion: RejectEventSuggestionCommand,
    private readonly listMySuggestions: ListMyEventSuggestionsQuery,
    private readonly listPendingSuggestions: ListPendingEventSuggestionsQuery,
  ) {}

  @Version('1')
  @Get()
  @Public()
  @AppResponse('CONTENT_LISTED', PaginatedEventsDTO)
  list(@Query() query: ListEventsDTO) {
    return this.listEventsQuery.execute(query);
  }

  @Version('1')
  @Get('administration')
  @Roles([Role.CURATOR, Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_LISTED', PaginatedEventsDTO)
  listManagement(@Query() query: ListEventsDTO) {
    return this.listEventsForManagementQuery.execute(query);
  }

  @Version('1')
  @Post()
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('CONTENT_CREATED', EventDTO)
  create(@Body() input: CreateEventDTO) {
    return this.createEventCommand.execute(input);
  }

  @Version('1')
  @Post('suggestions')
  submit(@User('id') accountId: string, @Body() input: SubmitEventSuggestionDTO) {
    return this.submitSuggestion.execute(accountId, input);
  }

  @Version('1')
  @Get('suggestions/me')
  mySuggestions(@User('id') accountId: string) {
    return this.listMySuggestions.execute(accountId);
  }

  @Version('1')
  @Get('suggestions/pending')
  @Roles([Role.CURATOR, Role.ADMIN])
  pendingSuggestions() {
    return this.listPendingSuggestions.execute();
  }

  @Version('1')
  @Post('suggestions/:id/accept')
  @Roles([Role.CURATOR, Role.ADMIN])
  accept(
    @User('id') reviewerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() input: AcceptEventSuggestionDTO,
  ) {
    return this.acceptSuggestion.execute(id, reviewerId, input);
  }

  @Version('1')
  @Post('suggestions/:id/reject')
  @Roles([Role.CURATOR, Role.ADMIN])
  reject(@User('id') reviewerId: string, @Param('id', ParseUUIDPipe) id: string, @Body() input: RejectEventDTO) {
    return this.rejectSuggestion.execute(id, reviewerId, input);
  }

  @Version('1')
  @Get('id/:id')
  @Roles([Role.CURATOR, Role.MODERATOR, Role.ADMIN])
  @AppResponse('CONTENT_FETCHED', EventDTO)
  getManagement(@Param('id', ParseUUIDPipe) id: string) {
    return this.getEventByIdQuery.execute(id);
  }

  @Version('1')
  @Get(':slug')
  @Public()
  @AppResponse('CONTENT_FETCHED', EventDTO)
  get(@Param('slug') slug: string) {
    return this.getEventBySlugQuery.execute(slug);
  }

  @Version('1')
  @Patch(':id')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED', EventDTO)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() input: UpdateEventDTO) {
    return this.updateEventCommand.execute(id, input);
  }

  @Version('1')
  @Patch(':id/status')
  @Roles([Role.CURATOR, Role.ADMIN])
  @AppResponse('CONTENT_UPDATED', EventDTO)
  review(@Param('id', ParseUUIDPipe) id: string, @Body() input: ReviewEventDTO) {
    return this.reviewEventCommand.execute(id, input);
  }

  @Version('1')
  @Delete(':id')
  @Roles([Role.ADMIN])
  @AppResponse('CONTENT_DELETED')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteEventCommand.execute(id);
  }
}
