const fs = require("fs");

const readyQueue1 = [];
let readyQueue2 = [];
let waitingQueue = [];
let processInCpu;
let processInFuture;
let time = 0;
let first = true;
const ganttChart = [];
const timeUnit = 50;


class Process {
    constructor(name, arrivalTime, priority, bursts) {
        this.name = name;
        this.arrivalTime = arrivalTime;
        this.arrivalTime2 = arrivalTime;
        this.priority = priority;
        this.bursts = bursts;
        this.currentBurst = bursts[0];
        this.burstIndex = 0;
        this.queueNumber = 1;
        this.waitingTime = 0;
        this.responseTime = 0;
        this.terminateTime = 0;
    }
    
    terminate = () => {
        if (this.responseTime === 0) this.responseTime = time - this.arrivalTime;
        this.terminateTime = time;
        endProcessInGanttChart();
        this.updateProcesses();
        console.log(`${this.name} => Terminate => time: ${time}`);
    }
    
    transferToWaitinigQueue = () => {
        if (this.responseTime === 0) this.responseTime = time - this.arrivalTime;
        this.burstIndex++;
        this.currentBurst = this.bursts[this.burstIndex];
        this.arrivalTime2 = time + this.currentBurst;
        waitingQueue.push(this);
        endProcessInGanttChart();
        this.updateProcesses();
        console.log(`${this.name} => Transfer To Waiting Queue => time: ${time}`);
    }

    transferToReadyQueue2 = () => {
        this.queueNumber++;
        readyQueue2.push(this);
        endProcessInGanttChart();
        this.updateProcesses();
        console.log(`${this.name} => Transfer To Ready Queue 2 => time: ${time}`);
    }

    removeFromReadyQueue2 = () => {
        const filteredProcesses = readyQueue2.filter(p => p.name !== this.name);
        readyQueue2 = filteredProcesses;
    }

    removeFromWaitingQueue = () => {
        const filteredProcesses = waitingQueue.filter(p => p.name !== this.name);
        waitingQueue = filteredProcesses;
        this.burstIndex++;
        this.currentBurst = this.bursts[this.burstIndex];
        this.queueNumber = 1;
        const index = processes.findIndex(p => p.name === this.name);
        processes[index] = this;
        console.log(`${this.name} => Remove form Waiting Queue => time: ${time}`);
    }

    updateProcesses = () => {
        const index = processes.findIndex(p => p.name === this.name);
        processes[index] = this;
        processInCpu = null;
    }
}

const getDataFromFile = (fileName) => {
    const data = fs.readFileSync(fileName, 'utf8');
    const lines = data.split("\n");
    const dispatchLatency = parseInt(lines[0]);
    const quantum = parseInt(lines[1]);
    const processes = lines.slice(2).map(line => {
        let [name, values] = line.split(":");
        values = values.split(",").map(value => parseInt(value));
        return new Process(name, values[0], values[1], values.slice(2));
    });
    return {dispatchLatency, quantum, processes};
}

const clearOutput = () => {
    fs.writeFileSync("output.txt", "");
}

const appendToFile = newData => {
    let data = fs.readFileSync("output.txt", 'utf8');
    if (data !== "") data += "\n";
    data += newData;
    fs.writeFileSync("output.txt", data);
}

const getMinPriority = ps => {
    let min = 100;
    ps.forEach(p => {
        if (p.priority < min) min = p.priority;
    });
    const filteredProcesses = ps.filter(p => p.priority === min);
    let index = filteredProcesses.length - 1;
    if (filteredProcesses.length > 1) {
        filteredProcesses.forEach(p => {
            const index2 = filteredProcesses.findIndex(pr => pr.name === p.name);
            if (index2 < index) index = index2;
        })
    }
    filteredProcesses[index].removeFromReadyQueue2();
    return filteredProcesses[index];
}



const addWaitingTime = process => {
    process.waitingTime++;
    const index = processes.findIndex(p => p.name === this.name);
    processes[index] = process;
}

const appendToGanttChart = (process) => {
    const item = {
        name: process.name,
        start: time,
        end: 0,
    }
    ganttChart.push(item);
}

const endProcessInGanttChart = () => {
    ganttChart[ganttChart.length - 1].end = time;
}

const clearInitialWasteTime = () => {
    let min = 100;
    processes.forEach(p => {
        if (p.arrivalTime < min) min = p.arrivalTime;
    });
    processes.forEach(p => {
        p.arrivalTime -= min;
        p.arrivalTime2 -= min;
    })
}

const cpuProcessing = () => {
    const intervalId = setInterval(() => {
        // console.log("============================");
        // console.log("time:", time);
        // console.log("processInCpu: ", processInCpu ? processInCpu.name : null);
        // ======== check for waiting time ============
        readyQueue1.forEach(p => addWaitingTime(p));
        readyQueue2.forEach(p => addWaitingTime(p));
        // ======== check for waiting time ============
        let arrivedProcesses = processes.filter(p => p.terminateTime === 0 && p.arrivalTime2 === time);
        let process;
        if (arrivedProcesses.length)
        {
            // مظلوم نوازی
            // sort
            let newProcesses = arrivedProcesses.filter(p => p.arrivalTime === p.arrivalTime2);
            let processesFromWaitingQueue = arrivedProcesses.filter(p => p.arrivalTime !== p.arrivalTime2);
            arrivedProcesses = [];
            for (let i = 0; i < newProcesses.length; i++)
                arrivedProcesses.push(newProcesses[i]);
            for (let i = 0; i < processesFromWaitingQueue.length; i++)
                arrivedProcesses.push(processesFromWaitingQueue[i]);
            for (let i = 0; i < arrivedProcesses.length; i++)
            {
                let arrivedProcess = arrivedProcesses[i];
                if (arrivedProcess.burstIndex !== 0) arrivedProcess.removeFromWaitingQueue();
                if (arrivedProcess.queueNumber === 1) readyQueue1.push(arrivedProcess);
                else readyQueue2.push(arrivedProcess);
            }
        }
        if (processInCpu) {
            if (processInCpu.currentBurst === 0) {
                if (processInCpu.burstIndex + 1 == processInCpu.bursts.length) processInCpu.terminate();
                else  processInCpu.transferToWaitinigQueue();
            }
            else if (processInCpu.queueNumber === 1 && processInCpu.bursts[processInCpu.burstIndex] - processInCpu.currentBurst === quantum) processInCpu.transferToReadyQueue2();
        }
        if (!processInCpu) {
            if (processInFuture || ((waitingQueue.length || processes.filter(p => p.terminateTime === 0).length) && !readyQueue1.length && !readyQueue2.length)) {
                time++;
                return;
            }
            process = readyQueue1.shift();
            if (!process) process = readyQueue2.length ? getMinPriority(readyQueue2) : null;
            if (!process) {
                clearInterval(intervalId);
                drawGanttChart();
                calculate();
                return;
            }
            if (first) {
                processInCpu = process;
                appendToGanttChart(process);
                first = false;
            }
            else if (dispatchLatency === 0) {
                processInCpu = process;
                appendToGanttChart(process);
            }
            else {
                processInFuture = process;
                setTimeout(() => {
                    processInCpu = process;
                    processInFuture = null;
                    appendToGanttChart(process);
                }, dispatchLatency * timeUnit)
            };
        }
        if (processInCpu) processInCpu.currentBurst--;
        time++;
    }, timeUnit);
}

const drawGanttChart = () => {
    let lines = ["","","",""];
    for (let i = 0; i < ganttChart.length; i++)
    {
        console.log(ganttChart[i]);
        if (dispatchLatency !== 0 && i !== 0)
        {
            let difference = ganttChart[i].start - ganttChart[i-1].end;
            let includeIdle = difference > dispatchLatency;
            lines[1] += "|";
            if (includeIdle) {
                lines[1] += "id";
                lines[1] += "\t";
                lines[1] += "|";
            }
            lines[1] += "dl";
            lines[1] += "\t";
            lines[3] += ganttChart[i-1].end;
            if (includeIdle) {
                lines[3] += "\t";
                lines[3] += ganttChart[i-1].end + (difference - dispatchLatency);
            }
            lines[3] += "\t";
        }
        lines[1] += "|";
        lines[1] += ganttChart[i].name;
        lines[1] += "\t";
        lines[3] += ganttChart[i].start;
        lines[3] += "\t";
        if (i + 1 === ganttChart.length)
        {
            lines[1] += "|";
            lines[3] += ganttChart[i].end;
        }
    }
    for (let i = 0; i < lines[1].length; i++) {
        lines[0] += "-";
        lines[2] += "-";
    }
    let newData = "";
    for (let i = 0; i < lines.length; i++)
        newData += lines[i] + "\n";
    appendToFile(newData);
}

const calculate = () => {
    const count = processes.length;
    let waitingTime = 0;
    let turnaroundTime = 0;
    let responseTime = 0;
    console.log("==============");
    processes.forEach(p => {
        // console.log(`${p.name} => waiting time => ${p.waitingTime}`);
        // console.log(`${p.name} => response time => ${p.responseTime}`);
        // console.log(`${p.name} => turnaround time => ${p.terminateTime - p.arrivalTime}`);
        waitingTime += p.waitingTime;
        turnaroundTime += p.terminateTime - p.arrivalTime;
        responseTime += p.responseTime;
    });
    const cpu_utilization = ((time - calculateWasteTime()) / time) * 100;
    const awt = waitingTime / count;
    const att = turnaroundTime / count;
    const art = responseTime / count;
    const newData = `CPU utilization = ${cpu_utilization.toFixed(2)}%\nAWT = ${awt.toFixed(2)}\nATT = ${att.toFixed(2)}\nART = ${art.toFixed(2)}`;
    appendToFile(newData);
}

const calculateWasteTime = () => {
    let waste = 0;
    for (let i = 0; i < ganttChart.length; i++)
    {
        if (i === ganttChart.length - 1) break;
        waste += ganttChart[i+1].start - ganttChart[i].end;
    }
    return waste;
}


const {dispatchLatency, quantum, processes} = getDataFromFile("input.txt");
clearOutput();
clearInitialWasteTime();
cpuProcessing();