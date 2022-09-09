import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Task } from '../models/task';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly STORAGE_KEY: string = 'MY-TASKS';
  private _tasks: Task[] = null;

  constructor(private _storage: Storage) {}

  async store(): Promise<void> {
    await this._storage?.set(this.STORAGE_KEY, this._tasks);
  }

  async getAll(): Promise<Task[]> {
    if (!this._tasks) {
      await this._storage.create();
      this._tasks = (await this._storage.get(this.STORAGE_KEY)) || [];
    }
    return this._tasks;
  }

  async add(task: Task): Promise<void> {
    if (this.validateTask(task)) {
      task.id = Date.now();
      this._tasks.push(task);
      await this.store();
    }
  }

  async update(task: Task): Promise<void> {
    console.log(this._tasks)


    if (this.validateTask(task)) {
      const index = this._tasks.findIndex((item) => item.id === task.id);

      if (index >= 0) {
        this._tasks[index] = task;
        await this.store();
      }
    }

    console.log(this._tasks)

  }

  async remove(taskId: number): Promise<void> {
    const index = this._tasks.findIndex((item) => item.id === taskId);

    if (index >= 0) {
      this._tasks.splice(index, 1);
      await this.store();
    }
  }

  async reorderTask(initialPosition: number, endPosition: number) {
    const task = this._tasks[initialPosition];
    this._tasks.splice(initialPosition, 1);
    this._tasks.splice(endPosition, 0, task);
    await this.store();
  }

  private validateTask(task: Task): boolean {
    return task?.name.trim().length > 0;
  }
}
