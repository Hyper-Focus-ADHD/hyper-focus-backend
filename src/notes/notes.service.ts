import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

import { BoardsService } from '../boards/boards.service';
import { Board } from '../boards/entities/board.entity';
import { messagesHelper } from '../helpers/messages-helper';

import { CreateNoteDto } from './dtos/create-note.dto';
import { UpdateNoteDto } from './dtos/update-note.dto';
import { Note } from './entities/note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private readonly noteRepository: Repository<Note>,
    private readonly boardsService: BoardsService,
  ) {}

  async createNote(
    userId: string,
    board: Board,
    createNoteDto: CreateNoteDto,
  ): Promise<Note> {
    const boardId = JSON.parse(JSON.stringify(board));
    await this.boardsService.findOneBoardOrFail({
      where: { id: boardId, user: { id: userId } },
    });

    const note = await this.noteRepository.create({
      text: createNoteDto.text,
      color: createNoteDto.color,
      placement: createNoteDto.placement,
    });

    note.board = board;

    return await this.noteRepository.save(note);
  }

  async findAllNotesByBoardId(
    userId: string,
    boardId: string,
  ): Promise<Note[]> {
    const boards = await this.boardsService.findAllBoardsByUserId({
      where: { user: { id: userId } },
    });

    const foundBoard = boards.find((board) => board.id === boardId);
    if (!foundBoard) {
      throw new NotFoundException(messagesHelper.BOARD_NOT_FOUND);
    }

    return await this.noteRepository.find({
      where: { board: { id: foundBoard.id } },
    });
  }

  async findOneNoteOrFail(options: FindOneOptions<Note>): Promise<Note> {
    try {
      return await this.noteRepository.findOneOrFail(options);
    } catch (error: unknown) {
      throw new NotFoundException(messagesHelper.NOTE_NOT_FOUND);
    }
  }

  async updateNote(
    userId: string,
    boardId: string,
    noteId: string,
    updateNoteDto: UpdateNoteDto,
  ): Promise<Note> {
    await this.boardsService.findOneBoardOrFail({
      where: { id: boardId, user: { id: userId } },
    });

    const note = await this.findOneNoteOrFail({
      where: { id: noteId, board: { id: boardId } },
    });

    this.noteRepository.merge(note, updateNoteDto);

    return await this.noteRepository.save(note);
  }

  async removeNote(
    userId: string,
    boardId: string,
    noteId: string,
  ): Promise<UpdateResult> {
    await this.boardsService.findOneBoardOrFail({
      where: { id: boardId, user: { id: userId } },
    });

    const note = await this.findOneNoteOrFail({
      where: { id: noteId, board: { id: boardId } },
    });

    return await this.noteRepository.softDelete(note.id);
  }

  async restoreNote(
    userId: string,
    boardId: string,
    noteId: string,
  ): Promise<UpdateResult> {
    await this.boardsService.findOneBoardOrFail({
      where: { id: boardId, user: { id: userId } },
    });

    const note = await this.findOneNoteOrFail({
      where: { id: noteId, board: { id: boardId } },
      withDeleted: true,
    });

    return await this.noteRepository.restore(note.id);
  }
}
