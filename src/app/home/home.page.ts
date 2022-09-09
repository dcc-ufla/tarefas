import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonInput,
} from '@ionic/angular';
import {
  ItemReorderEventDetail
} from '@ionic/core';
import { Task } from '../models/task';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('autofocus', { static: false }) inputTask: IonInput;

  tasks: Task[] = [];
  taskName: string = '';
  isReordering: boolean = false;

  constructor(
    private _taskService: TaskService,
    private _actionSheetCtrl: ActionSheetController,
    private _alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  setFocus() {
    setTimeout(() => {
      this.inputTask.setFocus();
    }, 300);
  }

  async loadTasks(): Promise<void> {
    this.tasks = await this._taskService.getAll();
  }

  async addTask(): Promise<void> {
    const task: Task = {
      name: this.taskName,
      isDone: false,
    };

    await this._taskService.add(task);
    this.taskName = '';
    this.loadTasks();
    this.setFocus();
  }

  async toggleTask(task: Task): Promise<void> {
    task.isDone = !task.isDone;
    await this._taskService.update(task);
    this.loadTasks();
  }

  async editTaskName(task: Task): Promise<void> {
    const alertInput = await this._alertCtrl.create({
      header: 'Editar tarefa',
      inputs: [
        {
          name: 'taskName',
          type: 'text',
          value: task.name,
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: async (data) => {
            const updatedTask = { ...task, name: data.taskName };
            await this._taskService.update(updatedTask);
            this.loadTasks();
          },
        },
      ],
    });
    await alertInput.present();
  }

  async scheduleTask(task: Task): Promise<void> {
    const alertInput = await this._alertCtrl.create({
      header: 'Agendar tarefa',
      inputs: [
        {
          name: 'deadline',
          type: 'date',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Salvar',
          handler: async (data) => {
            const updatedTask = { ...task, deadline: data.deadline };
            await this._taskService.update(updatedTask);
            this.loadTasks();
          },
        },
      ],
    });
    await alertInput.present();
  }

  async removeTask(task: Task): Promise<void> {
    await this._taskService.remove(task.id);
    this.loadTasks();
  }

  async showMenu(task: Task) {
    const actionSheet = await this._actionSheetCtrl.create({
      header: 'Menu',
      buttons: [
        {
          icon: 'create-outline',
          text: 'Editar',
          handler: () => this.editTaskName(task),
        },
        {
          icon: 'calendar-number-outline',
          text: 'Agendar',
          handler: () => this.scheduleTask(task),
        },
        {
          icon: 'trash-outline',
          text: 'Remover',
          handler: () => this.removeTask(task),
        },
      ],
    });

    await actionSheet.present();
  }

  async reorderTask(e: Event) {
    const event = e as CustomEvent<ItemReorderEventDetail>;
    const initialPosition = event.detail.from;
    const endPosition = event.detail.to;
    event.detail.complete();
    await this._taskService.reorderTask(initialPosition, endPosition);
  }

  toggleReorder() {
    this.isReordering = !this.isReordering;
  }

  get today(): Date {
    return new Date();
  }
}
