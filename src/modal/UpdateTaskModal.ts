const moment = require("moment");
import { DropdownComponent, Modal, Setting } from "obsidian";
import { customSetting } from "../helper/CustomSettingElement";
import GoogleTasks from "../GoogleTasksPlugin";
import { getListId } from "../view/GoogleTaskView";
import { getAllTaskLists } from "../googleApi/ListAllTasks";
import { Task } from "../helper/types";
import { CreateGoogleTaskFromOldTask } from "src/googleApi/GoogleCreateTask";
import { DeleteGoogleTask } from "src/googleApi/GoogleDeleteTask";

export class UpdateTaskModal extends Modal {
	plugin: GoogleTasks;
	newTask: Task;
	oldTaskSelfLInk: string;

	constructor(plugin: GoogleTasks, task: Task) {
		super(plugin.app);
		this.plugin = plugin;
		this.newTask = task;
		this.oldTaskSelfLInk = task.selfLink;
	}
	onOpen() {
		getAllTaskLists(this.plugin).then((taskList) => {
			const { contentEl } = this;

			contentEl.createEl("h1", { text: "Edit Task" });

			new Setting(contentEl)
				.setName("Title")

				.addText((text) => {
					text.onChange((value) => {
						this.newTask.title = value;
					});
					text.setValue(this.newTask.title);
					text.inputEl.focus();
				});

			new Setting(contentEl).setName("Details").addText((text) => {
				text.onChange((value) => {
					this.newTask.notes = value;
				});
				text.setValue(this.newTask.notes);
			});

			const dateSelectElement = customSetting(
				contentEl,
				"Due date",
				""
			).createEl("input", {
				type: "date",
			});

			dateSelectElement.addEventListener("input", (event) => {
				this.newTask.due = dateSelectElement.value;
			});

			if (this.newTask.due) {
				dateSelectElement.value = moment(this.newTask.due).format(
					"YYYY-MM-DD"
				);
			}

			const dropDown = new Setting(contentEl);

			dropDown.setName("Categorie");
			dropDown.addDropdown((text: DropdownComponent) => {
				text.onChange((value) => {
					this.newTask.parent = value;
				});

				for (let i = 0; i < taskList.length; i++) {
					text.addOption(taskList[i].id, taskList[i].title);
				}

				text.setValue(getListId(this.newTask));
				this.newTask.parent = getListId(this.newTask);

				return text;
			});

			new Setting(contentEl).addButton((button) =>
				button.setButtonText("Update").onClick(() => {
					CreateGoogleTaskFromOldTask(this.plugin, this.newTask);
					DeleteGoogleTask(this.plugin, this.oldTaskSelfLInk, false);
					this.close();
				})
			);
		});
	}
	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}
