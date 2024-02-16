let Calendar = {
	props: ['addDates', 'defineValues', 'closeList'],
	data() {
		return {
			week: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			years: ['2022', '2023', '2024', '2025', '2026', '2027', '2028'],
			chosenYear: '',
			chosenMonth: ''
		}
	},
	created() {
		let date = new Date();
		let year = date.getFullYear();
		let month = this.months[date.getMonth()];

		this.chosenYear = year;
		this.chosenMonth = month;
	},
	methods: {
		setActive() {
			if (event.target.innerHTML) {
				let days = document.querySelectorAll('.days');
				for (let day of days) {
					day.classList.remove('active');
				}
				event.target.classList.add('active');
			}
		},
		getDate() {
			let year = this.chosenYear;
			let month = this.months.indexOf(this.chosenMonth);

			let startDate = new Date(year, month, 1);
			let startDay = this.indexRedefinition(startDate.getDay());
			
			let endDate = new Date(year, month + 1, 0);
			let endDay = endDate.getDate();

			return {
				startDay,
				endDay
			}
		},
		setDay(param) {
			let date = this.getDate();
			let diff = param - (date.startDay);

			return this.helperFunction(param, diff);
		},
		setDayClass(param) {
			return this.helperFunction(param, 'days');
		},
		helperFunction(param, variable) {
			let date = this.getDate();
			if (param - 1 >= date.startDay && param <= date.endDay + date.startDay) {
				return variable;
			}
		},
		indexRedefinition(param) {
			return param == 0 ? 6 : --param;
		},
		elementCount() {
			let date = this.getDate();

			if (date.startDay == 6 && date.endDay >= 30) {
				return 42;
			} else if (date.startDay == 0 && date.endDay == 28) {
				return 28;
			} else {
				return 35;
			}
		}
	},
	template: `
		<div>
			<select class="date" v-model="chosenYear" @click="closeList">
				<option v-for="year in years">{{ year }}</option>
			</select>
			<select class="date" v-model="chosenMonth" @click="closeList">
				<option v-for="month in months">{{ month }}</option>
			</select>

			<ul class="days-names">
				<li class="days-names" v-for="day in week">{{ day }}</li>
			</ul>
			<ul>
				<li v-for="i in elementCount()" :class="setDayClass(i)" @click="addDates(months, chosenMonth, years, chosenYear); defineValues(months, chosenMonth, chosenYear); setActive()">{{ setDay(i) }}</li>
			</ul>
		</div>
	`
}

let List = {
	props: ['yearNumber', 'monthNumber', 'dayNumber', 'isActive', 'days', 'closeList'],
	methods: {
		addTask() {
			if (event.target.value.trim() != "") {
				this.days[0][this.yearNumber][this.monthNumber][this.dayNumber].push({
					task: event.target.value,
					checked: false,
				});
				event.target.value = '';
			}
		},
		checkTask(item) {
			item.checked = !item.checked;
		},
		getChecked(item) {
			return item.checked;
		},
		getClasses(name, item) {
			return item.checked ? name + ' checked' : name;
		},
		closeTask(key) {
			this.days[0][this.yearNumber][this.monthNumber][this.dayNumber].splice(key, 1);
		},
		editValue(item) {
			if (!item.checked) {
				let checkbox = event.target.previousElementSibling;
				let elemValue = event.target.innerHTML;
				let input = event.target.nextElementSibling;
				let closeBtn = input.nextElementSibling;
				
				event.target.classList.add('invisible');
				event.target.classList.remove('item-text');
				
				checkbox.classList.add('invisible');
				closeBtn.classList.add('invisible');
				
				input.value = elemValue;
				input.classList.remove('invisible');
				input.focus();
			}
		},
		saveValue(key) {
			let elemValue = event.target.value;
			let p = event.target.previousElementSibling;
			let checkbox = p.previousElementSibling;
			let closeBtn = event.target.nextElementSibling;
			
			event.target.classList.add('invisible');
			
			checkbox.classList.remove('invisible');
			closeBtn.classList.remove('invisible');
			
			p.classList.remove('invisible');
			p.classList.add('item-text');
			
			if (event.target.value.trim() != "") {
				this.days[0][this.yearNumber][this.monthNumber][this.dayNumber][key].task = elemValue;
			}
		},
	},
	template: `
		<transition name="list">
			<div v-if="isActive" class="container">
				<div class="tasklist">
					<h3>To do list</h3>
					<div class="close-img" @click="closeList"></div>
					<transition-group name="element" tag="div" class="taskList">
						<div v-for="(item, key) in days[0][yearNumber][monthNumber][dayNumber]" :class="'task'" :key="item.task + key">
							<input type="checkbox" class="checkbox" @click="checkTask(item)" :checked="getChecked(item)">
							<p :class="getClasses('item-text', item)" @click="editValue(item)">{{ item.task }}</p>
							<input class="invisible edit-field" @blur="saveValue(key)" @keyup.enter="saveValue(key)">
							<div class="close-img" :class="getClasses('task-img', item)" @click="closeTask(key)"></div>
						</div>
					</transition-group>
				</div>
				<p>Add task:</p>
				<input class="new-data" @keyup.enter="addTask">
			</div>
		</transition>
	`
}

let vm = new Vue({
	el: '#app',
	data: {
		yearNumber: null,
		monthNumber: null,
		dayNumber: null,

		isActive: false,
		days: []
	},
	components: {
		'my-calendar' : Calendar,
		'to-do-list' : List
	},
	methods: {
		addDates(months, chosenMonth, years, chosenYear) {
			if (event.target.innerHTML) {

				//Добавляем годы (1 раз)
				if (this.days.length == 0) {
					let obj = {};
					for (let year of years) {
						obj[year] = [];
					}
					this.days.push(obj);
				}

				//Добавляем месяцы (1 раз)
				if (this.days[0][chosenYear].length == 0) {
					for (let i = 0; i < 12; i++) {
						this.days[0][chosenYear].push([]);
					}
				}

				//Добавляем дни (1 раз)
				if (this.days[0][chosenYear][months.indexOf(chosenMonth)].length == 0) {
					for (let i = 0; i < 31; i++) {
						this.days[0][chosenYear][months.indexOf(chosenMonth)].push([]);
					}
				}
			}
		},
		defineValues(months, chosenMonth, chosenYear) {
			if (event.target.innerHTML) {
				this.dayNumber = event.target.innerHTML - 1;
				this.monthNumber = months.indexOf(chosenMonth);
				this.yearNumber = chosenYear;
				this.isActive = true;
			}
		},
		closeList() {
			this.isActive = false;

			let days = document.querySelectorAll('.days');
			for (let day of days) {
				day.classList.remove('active');
			}
		}
	}
});
