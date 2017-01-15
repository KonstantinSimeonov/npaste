'use strict';

$(() => {
    $('#clone-btn').copyToClipboardBtn('code');
    $('#copy-url-btn').copyToClipboardBtn(() => window.location.href);

    const $embedBtn = $('#btn-get-embedded'),
        rawUrl = 'https://' + window.location.host + $embedBtn.data('url'),
        height = $('pre code').css('height');

    $embedBtn.copyToClipboardBtn(() => `<iframe width="600" height="${height}" style="font-size: 18px;" src="${rawUrl}" frameborder="0" allowfullscreen></iframe>`);

    $('#edit-btn').on('click', () => {
        const $editForm = $('.form-edit-paste');

        $editForm.find('textarea').text($('code').text());
        $editForm.removeClass('hidden');
    });

});