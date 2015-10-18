$(function () {
    $(window).load(function () {
        $.getJSON(
            // NB: using Open Exchange Rates here, but you can use any source!
            'https://openexchangerates.org/api/latest.json?app_id=04f3983c994c4b358794aee611fe5fb8',
            function (data) {
                // Check money.js has finished loading:
                if (typeof fx !== "undefined" && fx.rates) {
                    fx.rates = data.rates;
                    fx.base = data.base;
                } else {
                    // If not, apply to fxSetup global:
                    var fxSetup = {
                        rates: data.rates,
                        base: data.base
                    }
                }
            }
        );

        var dateCount = 30;
        var dateRange = [];
        var valueRange = [];
        var series = [{
            name: 'JPY',
            data: []
        },{
            name: 'RUB',
            data: []
        },{
            name: 'INR',
            data: []
        }];


        var currency = {};
        currency.name = 'INR';
        currency.data = [];
        currency.tooltip = {valueDecimals: 2};
        for (var i = 0; i < dateCount; i++) {
            var date = moment().subtract(dateCount - i, 'days');
            dateRange.push(date.format('DD'));
            //console.log(date.format('X')*1000);
            //console.log('http://api.fixer.io/' + moment().subtract(dateCount - i, 'days').format('YYYY-MM-DD') + '?base=USD')
            $.getJSON('https://api.fixer.io/' + date.format('YYYY-MM-DD') + '?base=USD', function (data) {
                currency.data.push([(parseInt(moment().subtract(dateCount - currency.data.length, 'days').format('X'))*1000),data.rates[currency.name]]);
                for(var j = 0; j < series.length; j++){
                    series[j].data.push(data.rates[series[j].name]);
                }

            })
                .success(function () {
                    if(currency.data.length == dateCount){
                        $(".loader").remove();
                        renderGraph(currency);
                        renderChart(series)
                    }
                });

        }
    });
});
var renderGraph = function (currency) {
    // Create the chart
    $('#highstock').highcharts('StockChart', {


        rangeSelector: {
            selected: 1
        },

        title: {
            text: 'USD vs. '+currency.name
        },
        credits: {
            enabled: false
        },

        series: [{
            name: currency.name,
            data: currency.data,
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
};
var renderChart = function (series) {
    $('#highcharts').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'USD vs. EUR vs. INR vs. RUB'
        },
        xAxis: {
            title: {
                text: 'Time (last 30 days)'
            }
        },
        yAxis: {
            title: {
                text: 'Conversion Rate (vs. USD) (Lower is better)'
            }
        },
        series: series
    });
    $("svg text:contains('Highcharts.com'),svg desc").remove();
};