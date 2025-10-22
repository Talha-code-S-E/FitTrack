// ==============================
// CLASSES
// ==============================

// Represents a single exercise in a workout
class Exercise {
    constructor(name, duration, caloriesBurned) {
        this.name = name;
        this.duration = duration;
        this.caloriesBurned = caloriesBurned;
    }

    // Returns a formatted string describing the exercise
    getDetails() {
        return `${this.name} - ${this.duration} min (${this.caloriesBurned} cal)`;
    }

    // Calories burned per minute
    getCaloriesPerMinute() {
        return this.caloriesBurned / this.duration;
    }
}

// Represents a complete workout session
class Workout {
    constructor(name, date, type) {
        this.name = name;
        this.date = date;
        this.type = type;
        this.exercises = [];
    }

    addExercise(exercise) {
        this.exercises.push(exercise);
    }

    totalDuration() {
        return this.exercises.reduce((total, ex) => total + ex.duration, 0);
    }

    totalCalories() {
        return this.exercises.reduce((total, ex) => total + ex.caloriesBurned, 0);
    }

    exerciseCount() {
        return this.exercises.length;
    }

    getSummary() {
        return {
            name: this.name,
            date: this.date,
            type: this.type,
            duration: this.totalDuration(),
            calories: this.totalCalories(),
            exerciseCount: this.exerciseCount()
        };
    }
}

// Represents a user and their workout history
class User {
    constructor(name) {
        this.name = name;
        this.workouts = [];
    }

    addWorkout(workout) {
        this.workouts.push(workout);
    }

    getTotalWorkouts() {
        return this.workouts.length;
    }

    getTotalDuration() {
        return this.workouts.reduce((total, w) => total + w.totalDuration(), 0);
    }

    getTotalCalories() {
        return this.workouts.reduce((total, w) => total + w.totalCalories(), 0);
    }

    getAverageDuration() {
        if (this.workouts.length === 0) return 0;
        return Math.round(this.getTotalDuration() / this.workouts.length);
    }

    getRecentWorkouts() {
        return [...this.workouts].sort((a,b) => new Date(b.date) - new Date(a.date));
    }

    getStats() {
        return {
            totalWorkouts: this.getTotalWorkouts(),
            totalDuration: this.getTotalDuration(),
            totalCalories: this.getTotalCalories(),
            averageDuration: this.getAverageDuration()
        };
    }
}

// ==============================
// APP CONTROLLER
// ==============================

class FitnessApp {
    constructor() {
        this.currentUser = new User("Demo User");

        // Initialize sample workouts
        this.initializeSampleData();

        // Set up listeners
        this.setupEventListeners();

        // Initial render
        this.render();
    }

    initializeSampleData() {
        const workout1 = new Workout("Morning Run", "2025-10-20", "Cardio");
        workout1.addExercise(new Exercise("Running", 30, 300));
        workout1.addExercise(new Exercise("Stretching", 10, 30));
        this.currentUser.addWorkout(workout1);

        const workout2 = new Workout("Gym Session", "2025-10-19", "Strength");
        workout2.addExercise(new Exercise("Bench Press", 20, 150));
        workout2.addExercise(new Exercise("Squats", 25, 200));
        workout2.addExercise(new Exercise("Pull-ups", 15, 120));
        this.currentUser.addWorkout(workout2);
    }

    setupEventListeners() {
        const form = document.getElementById('workoutForm');
        form.addEventListener('submit', (e) => this.handleWorkoutSubmit(e));

        // Default date is today
        document.getElementById('workoutDate').valueAsDate = new Date();

        // Add exercise dynamically
        document.getElementById('addExerciseBtn').addEventListener('click', () => this.addExerciseField());

        // Delegate remove exercise buttons
        document.getElementById('exerciseContainer').addEventListener('click', (e) => {
            if(e.target.classList.contains('removeExerciseBtn')){
                e.target.parentElement.remove();
            }
        });
    }

    addExerciseField() {
        const container = document.getElementById('exerciseContainer');
        const div = document.createElement('div');
        div.classList.add('exercise-entry');
        div.innerHTML = `
            <div class="form-group">
                <label>Exercise Name</label>
                <input type="text" class="exerciseName" required placeholder="e.g., Running">
            </div>
            <div class="form-group">
                <label>Duration (minutes)</label>
                <input type="number" class="exerciseDuration" required min="1" placeholder="30">
            </div>
            <div class="form-group">
                <label>Calories Burned</label>
                <input type="number" class="exerciseCalories" required min="1" placeholder="250">
            </div>
            <button type="button" class="removeExerciseBtn">Remove Exercise</button>
            <hr>
        `;
        container.appendChild(div);
    }

    handleWorkoutSubmit(event) {
        event.preventDefault();

        const name = document.getElementById('workoutName').value;
        const date = document.getElementById('workoutDate').value;
        const type = document.getElementById('workoutType').value;

        const workout = new Workout(name, date, type);

        // Collect all exercises
        const exercises = document.querySelectorAll('.exercise-entry');
        exercises.forEach(entry => {
            const exName = entry.querySelector('.exerciseName').value;
            const duration = parseInt(entry.querySelector('.exerciseDuration').value);
            const calories = parseInt(entry.querySelector('.exerciseCalories').value);
            workout.addExercise(new Exercise(exName, duration, calories));
        });

        this.currentUser.addWorkout(workout);

        this.showMessage('Workout logged successfully!', 'success');

        event.target.reset();
        document.getElementById('workoutDate').valueAsDate = new Date();

        // Remove extra exercise entries leaving only the first
        const container = document.getElementById('exerciseContainer');
        container.innerHTML = container.children[0].outerHTML;

        this.render();
    }

    showMessage(message, type) {
        const container = document.getElementById('messageContainer');
        container.innerHTML = `<div class="message ${type}">${message}</div>`;
        setTimeout(() => container.innerHTML = '', 3000);
    }

    renderStats() {
        const stats = this.currentUser.getStats();
        const statsGrid = document.getElementById('statsGrid');
        statsGrid.innerHTML = `
            <div class="stat-card"><h3>${stats.totalWorkouts}</h3><p>Total Workouts</p></div>
            <div class="stat-card"><h3>${stats.totalDuration}</h3><p>Minutes Trained</p></div>
            <div class="stat-card"><h3>${stats.totalCalories}</h3><p>Calories Burned</p></div>
            <div class="stat-card"><h3>${stats.averageDuration}</h3><p>Avg. Duration (min)</p></div>
        `;
    }

    renderWorkouts() {
        const workouts = this.currentUser.getRecentWorkouts();
        const workoutList = document.getElementById('workoutList');

        if(workouts.length === 0){
            workoutList.innerHTML = '<p class="info">No workouts logged yet. Add your first workout above!</p>';
            return;
        }

        workoutList.innerHTML = workouts.map(workout => {
            const summary = workout.getSummary();
            const exerciseList = workout.exercises.map(ex => `<li class="exercise-item">${ex.getDetails()}</li>`).join('');

            return `
                <div class="workout-item">
                    <h4>${summary.name}</h4>
                    <div class="workout-details">
                        <span><strong>Date:</strong> ${summary.date}</span>
                        <span><strong>Type:</strong> ${summary.type}</span>
                        <span><strong>Duration:</strong> ${summary.duration} min</span>
                        <span><strong>Calories:</strong> ${summary.calories}</span>
                    </div>
                    <ul class="exercise-list">${exerciseList}</ul>
                </div>
            `;
        }).join('');
    }

    render() {
        this.renderStats();
        this.renderWorkouts();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const app = new FitnessApp();
    window.fitnessApp = app;
});
