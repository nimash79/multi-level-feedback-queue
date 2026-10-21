# Multi-Level Feedback Queue CPU Scheduler

A **CPU scheduling simulator** implemented in Node.js that demonstrates a multi-level feedback queue (MLFQ) scheduling strategy. The project simulates process execution, queue transitions, dispatch latency, and waiting periods, then generates a Gantt chart and calculates important CPU scheduling metrics.

## Overview

The Multi-Level Feedback Queue (MLFQ) is a CPU scheduling approach that organizes processes into multiple queues with different scheduling priorities. Processes can move between queues according to their execution behavior, allowing the scheduler to balance responsiveness and CPU allocation.

This project implements a two-queue scheduling simulation with support for process arrival times, priorities, CPU bursts, waiting periods, and configurable scheduling parameters.

The simulator reads process definitions from `input.txt`, executes the scheduling simulation, and writes the resulting schedule and performance metrics to `output.txt`.

## Features

- **Multi-level scheduling:** Simulates two ready queues with different scheduling behavior.
- **Round-robin scheduling:** Uses a configurable time quantum for the first ready queue.
- **Priority-based scheduling:** Selects processes from the second ready queue according to their configured priorities.
- **Process arrival handling:** Supports processes that enter the system at different times.
- **CPU and waiting bursts:** Models processes with sequences of execution and waiting periods.
- **Dispatch latency:** Accounts for configurable overhead when switching to another process.
- **Queue transitions:** Moves processes between scheduling queues and returns processes from waiting periods to a ready queue.
- **Gantt chart generation:** Produces a textual representation of the execution timeline.
- **Scheduling metrics:** Calculates CPU utilization, average waiting time, average turnaround time, and average response time.
- **File-based input and output:** Reads process definitions from `input.txt` and writes simulation results to `output.txt`.
- **Event logging:** Prints scheduling and process-transition events to the console.

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript | Scheduling logic and simulation |
| Node.js | Runtime environment |
| Node.js `fs` module | Reading input and writing output files |
| Nodemon | Automatically restarting the application during development |

The project has minimal external dependencies and does not require a database or web server.

## How the Scheduler Works

The simulation maintains two ready queues and a waiting queue.

### Queue 1 — Round Robin

New processes enter the first ready queue.

- Processes are scheduled using Round Robin.
- Each process can execute for up to the configured time quantum before being moved to the second ready queue, provided its current CPU burst has not completed.
- If a process completes its CPU burst, it either terminates or enters the waiting queue for its next waiting burst.

### Queue 2 — Priority-Based Scheduling

Processes that are moved out of the first ready queue are placed in the second ready queue.

- The scheduler selects a process according to its configured priority.
- Processes that complete a CPU burst may enter the waiting queue.
- After a waiting period completes, a process returns to a ready queue according to the simulation's queue-transition logic.

The implementation uses the numeric priority values in `input.txt` when selecting among processes in the second queue. Lower numeric values are treated as higher priority.

### Waiting Queue

The waiting queue represents processes that are not currently ready to execute on the CPU.

When a process completes a CPU burst and has another burst remaining, it enters the waiting queue. Once its waiting period expires, it becomes ready for further execution.

### Dispatch Latency

Dispatch latency represents overhead associated with dispatching a process to the CPU. The simulator accepts this value as an input parameter and includes the corresponding delay in its execution timeline.

## Scheduling Workflow

```text
Read input.txt
      |
      v
Initialize Processes
      |
      v
Add Arrived Processes
      |
      v
Select a Ready Process
      |
      +-----------------------+
      |                       |
      v                       v
    Queue 1                 Queue 2
   Round Robin          Priority-Based
      |                       |
      +-----------+-----------+
                  |
                  v
             Execute Burst
                  |
          +-------+-------+
          |               |
          v               v
    Burst Completed   Quantum Expired
          |               |
          v               v
    Wait or Finish    Move to Queue 2
          |
          v
   Continue Scheduling
          |
          v
 Generate Gantt Chart
          |
          v
 Calculate Metrics
          |
          v
 Write output.txt
```

## Project Structure

```text
multi-level-feedback-queue/
├── main.js          # Process model and scheduling simulation
├── input.txt        # Simulation parameters and process definitions
├── output.txt       # Generated schedule and performance metrics
├── package.json     # Project metadata and npm scripts
├── package-lock.json
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) and npm.

Verify your installation:

```bash
node --version
npm --version
```

### 1. Clone the repository

```bash
git clone https://github.com/nimash79/multi-level-feedback-queue.git
cd multi-level-feedback-queue
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the input

Edit `input.txt` to define the scheduling parameters and processes. An example input file is included in the repository.

### 4. Run the simulation

```bash
npm start
```

The application reads `input.txt`, runs the simulation, prints scheduling events to the console, and writes the Gantt chart and scheduling metrics to `output.txt`.

For development, run:

```bash
npm run dev
```

This uses Nodemon to restart the application when the source code changes.

## Input Format

The input file contains two configuration lines followed by one line for each process.

```text
dispatch_latency
time_quantum
process_name:arrival_time,priority,burst_1,burst_2,...
```

The first line specifies the dispatch latency. The second line specifies the Round Robin time quantum for the first ready queue.

Each subsequent line describes one process.

| Field | Description |
|---|---|
| `process_name` | Unique identifier for the process. |
| `arrival_time` | Time at which the process enters the system. |
| `priority` | Numeric priority used by the second ready queue. Lower values represent higher priority. |
| `burst_1` | Initial CPU burst duration. |
| `burst_2` | Next waiting-period duration, if applicable. |
| Remaining bursts | Alternating CPU and waiting durations, according to the process model. |

### Example

```text
2
6
P0:0,1,7,2,4
P1:14,3,3,4,8
P2:12,0,12,2,2
```

In this example:

- The dispatch latency is `2` time units.
- The Round Robin quantum is `6` time units.
- `P0`, `P1`, and `P2` have different arrival times and priorities.
- Their burst sequences describe alternating execution and waiting periods.

The example illustrates the format used by the repository's `input.txt`.

**Input requirements:** Use unique process names, valid numeric values, and a consistent burst sequence. The current parser expects the process name to be separated from its comma-separated numeric fields by a colon.

## Output and Scheduling Metrics

The simulator writes its results to `output.txt`.

### Gantt Chart

The output includes a textual Gantt chart showing when each process occupies the CPU. Dispatch-latency intervals and idle periods can also be represented in the timeline.

A simplified illustration:

```text
| P0 | DL | P1 | P0 | P2 |
0    7    9    12   18   24
```

This is an illustrative format, not the actual output for the sample input.

### CPU Utilization

CPU utilization estimates the percentage of the simulated timeline spent performing CPU work rather than waiting through idle or dispatch-overhead intervals.

\[
\text{CPU Utilization}
=
\frac{\text{Total Time}-\text{Waste Time}}
{\text{Total Time}}\times100
\]

### Average Waiting Time

Average waiting time is the mean time processes spend waiting in the ready queues.

\[
\text{AWT}=\frac{\sum_{i=1}^{n} WT_i}{n}
\]

where \(WT_i\) is the waiting time accumulated by process \(i\), and \(n\) is the number of processes.

### Average Turnaround Time

Turnaround time measures the time between a process's arrival and its completion.

\[
\text{ATT}=\frac{\sum_{i=1}^{n} TAT_i}{n}
\]

where \(TAT_i\) is the turnaround time of process \(i\).

### Average Response Time

Response time measures the interval between a process's arrival and its first CPU execution.

\[
\text{ART}=\frac{\sum_{i=1}^{n} RT_i}{n}
\]

where \(RT_i\) is the response time of process \(i\).

The simulator reports these metrics alongside CPU utilization in the output file.

## Available Commands

| Command | Description |
|---|---|
| `npm install` | Install project dependencies. |
| `npm start` | Run the scheduling simulation. |
| `npm run dev` | Run the simulation with Nodemon. |

## Implementation Notes

- The simulation logic is implemented in `main.js`.
- The scheduler uses Node.js timers to advance the simulation.
- The `timeUnit` constant controls the real-time interval used by the timer-driven simulation; it is not the simulated CPU time quantum.
- The input and output filenames are currently hard-coded as `input.txt` and `output.txt`.
- The `test` script in `package.json` is a placeholder; automated tests are not configured.

This is an educational simulator rather than a production operating-system scheduler. Its results depend on the implemented queue-transition rules, input data, and simulation assumptions.

## Possible Improvements

Potential extensions include:

- Supporting a configurable number of feedback queues.
- Making queue policies and time quanta configurable per level.
- Adding automated tests for scheduling edge cases.
- Validating input data before starting the simulation.
- Separating simulation time from wall-clock timer intervals.
- Generating a graphical Gantt chart.
- Adding comparisons with FCFS, Shortest Job First, and standard Round Robin scheduling.
- Improving output formatting and process-level metric reporting.

## License

This repository is licensed under the **MIT License**, as indicated in the repository's README. Review the repository's license file for the applicable terms.

## Author

**Nima Sharifinia**

- GitHub: [@nimash79](https://github.com/nimash79)
- Repository: [multi-level-feedback-queue](https://github.com/nimash79/multi-level-feedback-queue)

---

Contributions that improve the scheduling model, input validation, simulation accuracy, and test coverage are welcome.
