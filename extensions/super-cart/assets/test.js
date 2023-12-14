class Test extends HTMLElement {
    constructor() {
        super()
        this.timer = document.createElement('span')
        this.date = new Date(this.getAttribute('prefix')).getTime()
        this.now = new Date().getTime()
        this.difference = this.date - this.now
        this.timer.innerText = this.difference
        this.appendChild(this.timer)
    }
    connectedCallback() {
        this.x = setInterval(function() {
            this.difference = this.date - this.now


            this.timer.innerText = this.difference

        }, 1000)
    }

}
class Timer extends HTMLElement {
    constructor() {
        super()
        this.days = document.createElement('span')
        this.hours = document.createElement('span')
        this.minuts = document.createElement('span')
        this.seconds = document.createElement('span')
        this.date = new Date(this.getAttribute('prefix')).getTime()
        this.appendChild(this.days)
        this.appendChild(this.hours)
        this.appendChild(this.minuts)
        this.appendChild(this.seconds)

    }
    connectedCallback() {
        var second = 1000,
                    minute = second * 60,
                    hour = minute * 60,
                    day = hour * 24;
        this.x = setInterval(() => {
            const now = new Date().getTime()
            if(this.date === null) {
                this.days.innerText = '0'
                this.hours.innerText = '0'
                this.minuts.innerText = '0'
                this.seconds.innerText = '0'
            }
            const distance = this.date - now
            
            this.days.innerText = Math.floor(distance / (day)) + ' days ',
            this.hours.innerText = Math.floor((distance % (day)) / (hour)) + ' hours '
            this.minuts.innerText = Math.floor((distance % (hour)) / (minute)) + ' minuts '
            this.seconds.innerText = Math.floor((distance % (minute)) / second) + 'seconds';
            if(distance < 0) {
                clearInterval(this.x)
            }
        }, 1000)
    }

}

customElements.define('test-one', Test);
customElements.define('test-timer', Timer);
