// progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/
var bar;
$(document).ready(function () {
    bar = new ProgressBar.Circle(progress_bar, {
        strokeWidth: 6,
        color: '#2196F3',
        trailColor: '#eee',
        trailWidth: 1,
        easing: 'easeInOut',
        duration: 1400,
        svgStyle: null,
        text: {
            value: '',
            alignToBottom: true
        },
        from: {
            color: '#2196F3'
        },
        to: {
            color: '#2196F3'
        },
        // Set default step function for all animate calls
        step: (state, bar) => {
            bar.path.setAttribute('stroke', state.color);
            var value = Math.round(bar.value() * 100);
            if (value === 0) {
                bar.setText('');
            } else {
                bar.setText(value);
            }

            bar.text.style.color = state.color;
        }
    });
    bar.text.style.fontFamily = '"Lato", Helvetica, sans-serif';
    bar.text.style.fontSize = '2rem';

});