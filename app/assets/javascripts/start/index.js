$(document).ready(function(){
    // set initial values from data rels
    //collect values from data-rel
    let prices = {}

    var sound = new Howl({
        src: ['/assets/pinwheel.mp3']
    });

    function saveInitialPrices(){
        $('.prices').each(function(price){
            prices[$(this).data('id')] = $(this).data('price')
        });
    };
    function saveNewPrices(data){
        data.forEach(function(log){
            prices[log.id] = log.new_price
        });
    };
    function transferToParams(obj){
      let map = new Map(Object.entries(obj))
      let params = []
      map.forEach(function(v, k){
        params.push(`prices[${k}]=${v}`)
      });
      return `${params.join('&')}`
    };

    function updatePriceDisplays(data) {
        Object.keys(data).forEach(function(key){
            $(`#${key}`).sevenSeg({ digits: 4, value: data[key]});
        });
    };
    function activateNewPriceSegments(id, value){
        $(`#${id}-new`).sevenSeg({ digits: 4, value: value});
        $(`#${id}-new .sevenSeg-segOn`).css("fill", "red");
        $(`#${id}-new .sevenSeg-svg`).css("fill", "#320000");
    }
    function appendComparisonDisplays(data) {
        data.log.forEach(function(val, i){
            let template = $(data.template[i])
            $(`#price-${val.id}-table`).append(template)
            activateNewPriceSegments(val.id, val.new_price)
        });
        $('.price-table').each(function(){
            $(this).removeClass('justify-content-center')
        });
    };
    function prepareModal(log, date) {
        //remove event displays if they exist
        $('.event-display').each(function(){
            $(this).remove();
        })
        log.forEach(function(log){
            let event = $(`#price-${log.id}-table`).clone().children('.price-display')
            .removeClass('new-price-display')
            .addClass('event-display')
            $('#event-log').append(event);
        });
        $('#update-date').html(`<span>${date}</span>`);
        turnOnHintLight();
        //Make ball activate modal
        $('#hint-ball').attr('data-target', '#last-event');
        $("#last-event").on('hidden.bs.modal', function () {
            turnOffHintLight();
        });
    };
    function turnOnHintLight() {
        $('#hint-ball').addClass('animate');
    };
    function turnOffHintLight() {
        $('#hint-ball').removeClass('animate');
    };
    function showSpinner() {
        $('#kitt').css('display', 'block');
    };
    function hideSpinner() {
        setTimeout(function(){
            $('#kitt').css('display', 'none');
        }, 1000)
    }
    function removeComparison() {
        $('.new-price-display').each(function() {
            $(this).remove();
        })
        $('.price-table').each(function(){
            $(this).addClass('justify-content-center')
        });
    };
    function requestNewPrices() {
        Rails.ajax({
            url: "/fetch",
            type: "post",
            data: transferToParams(prices),
            before: showSpinner(),
            success: function(data) {
                if(data.has_changed) {
                    appendComparisonDisplays(data);
                    saveNewPrices(data.log);
                    prepareModal(data.log, data.date);
                    sound.play();
                    setTimeout(() => {
                        updatePriceDisplays(prices)
                        removeComparison();
                    }, 30000);
                }
                hideSpinner()
            },
            error: function(data) {
            }
        })
    };
    function activateRequestInterval(timing) {
        let interval = setInterval(() => {
            requestNewPrices();
        }, timing);
    };
    saveInitialPrices();
    updatePriceDisplays(prices);
    activateRequestInterval(5000);
});
    