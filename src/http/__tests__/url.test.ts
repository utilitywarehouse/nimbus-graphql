import {URL} from '../http.url';

test('creates URL with both template and parsed string', () => {
    const address = URL.template('/{template}', {template: 'asd'});

    expect(address.urlTemplate()).toEqual('/{template}');
    expect(address.toString()).toEqual('/asd');
});
