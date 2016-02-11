# javascript-pagination


This small and highly customizable Javascript library uses JQuery to economically display an array of items, including descriptions and images, using:

* Pagination
* Filters
* Sorting

### Quick Start

The project consists of a single file called ```products.js```. To use it, add to the top of your HTML page, inside the ```<head>``` tags:

``` html
    <script src="path-to-library/products.js"> </script>
```

For instance, in a Django template:

``` html
    <script src="{% static "js/products.js" %}"> </script>
```

HTML elements have [Bootstrap](http://getbootstrap.com/) classes by default, but can be customized.

To display the items, which are referred to as products in the library, include the following ```div``` at the location where you want to display the items in your HTML page:

``` html
<div class="products" url="{{productsdir}}" ></div>
```

Here, the url should yield a JSON object containing an array of items (product objects). In the standard configuration, the library expects something of this form (an example with movie titles):

```
{ "products": [{"description": "Lady in the Water", "title": "Lady in the Water", "url": "/shop/product/lady-in-the-water/", "image": "/static/media/uploads/product/.thumbnails/2006_lady_in_the_water.jpg/2006_lady_in_the_water-150x75.jpg", "created": "2016-01-14 00:38:18.047406+00:00", "soldproduct__sold": "140", "price": "97.60"}, {"description": "Snakes on a Plane", "title": "Snakes on a Plane", "url": "/shop/product/snakes-on-a-plane/", "image": "/static/media/uploads/product/.thumbnails/snake.jpg/snake-150x75.jpg", "created": "2016-01-14 00:38:18.083100+00:00", "soldproduct__sold": "260", "price": "31.07"}, {"description": "You, Me and Dupree", "title": "You, Me and Dupree", "url": "/shop/product/you-me-and-dupree/", "image": "/static/media/uploads/product/.thumbnails/you_me_dupree.jpg/you_me_dupree-150x75.jpg", "created": "2016-01-14 00:38:18.119311+00:00", "soldproduct__sold": "150", "price": "19.95"}, {"description": "Superman Returns", "title": "Superman Returns", "url": "/shop/product/superman-returns/", "image": "/static/media/uploads/product/.thumbnails/superman.gif/superman-150x75.gif", "created": "2016-01-14 00:38:18.155732+00:00", "soldproduct__sold": "280", "price": "98.67"}, {"description": "The Night Listener", "title": "The Night Listener", "url": "/shop/product/the-night-listener/", "image": "/static/media/uploads/product/.thumbnails/night_listener.jpg/night_listener-150x75.jpg", "created": "2016-01-14 00:38:18.191412+00:00", "soldproduct__sold": "205", "price": "5.48"}, {"description": "Just My Luck", "title": "Just My Luck", "url": "/shop/product/just-my-luck/", "image": "/static/media/uploads/product/.thumbnails/luck.jpeg/luck-150x75.jpeg", "created": "2016-01-14 00:38:18.334920+00:00", "soldproduct__sold": "95", "price": "62.16"}], "sort_options": [["popularity", "-soldproduct__sold"], ["recently-added", "-date_added"], ["highest-rated", "-rating_average"], ["least-expensive", "unit_price"], ["most-expensive", "-unit_price"], ["title", "title"]]}
```

This is an array of product objects, and each product has attributes: description, title, url, image, created, soldproduct__sold and price. Modify the library code to handle different attributes.

As an example of a server-side script, the following Python code puts products from the [Mezzanine](http://mezzanine.jupo.org/docs/overview.html) framework (built on [Django](https://www.djangoproject.com/)) in the above format:

```python

def get_field(p,field):
    """
    Supporting function to JSONize. Gets field value from product object p.
    """

    try:
        value = getattr(p,field.split('__')[0])
        if hasattr(value,'__call__'):
            value = value()

        if isinstance(value,models.Model):

            if '__' in field:
                field = '__'.join(field.split('__')[1:])   # remove 1st element of dotted path
                value = get_field(value,field)    
            else:
                # Don't know which field to take
                value = ''


    except:
        if field == 'url':
            value = p.get_absolute_url()
        else:
            value = ''

    return value

def JSONize(products,fields=['url','image','title','price','description','soldproduct__sold', 'created'],additional={},thumbs={'dx':150,'dy':75}):
    """
    Serialize list of Product objects, turn to JSON.

    products: queryset
    fields: obtain value of field by this name from each Product object, if it exists, whether callable or not.
    additional: dictionary of additional key-value pairs to be updated into the result
    thumbs: thumbnail sizes

    returns jsonized total dict

    """

    total = {}
    prodList = []  # list of key-value dicts containing the relevant field values for each Product object. Becomes Javascript array of objects on unpacking.

    for p in products:
        # build the prodList 

        D = {} # dict to be filled with field name vs value in product. 
        for field in fields:
            value = get_field(p,field)

            if field == 'image':
                # special exception is image, which needs to be prepended and thumbnailed.
                value = settings.MEDIA_URL+value
                value = settings.MEDIA_URL+thumbnail(value,thumbs['dx'],thumbs['dy'])

            D[field] = str(value)

        prodList.append(D)

    total['products'] = prodList
    total.update(additional)

    return json.dumps(total)


```

### customization

The ```ProductDisplay``` object factory contains a ```layout``` object argument. The default values are: 

```
layout = {'buttons':{'loc':'paginate','type':'text'}, 
                                          'paginate':{'loc':'bottom','type':'list-inline'},
                                          'sorter' : 'top', 'filters' : 'side'
                                           })
```

These are good settings for a setup with pagination. If any of the elements, such as ```buttons``` or ```sorter``` are not required, simply omit them or set their value to ```none```. To create a simple row with left and right arrows to scroll through the products, simply select ```none``` for ```buttons.loc``` (no 1,2,3... pagination displayed) and ```arrow``` for ```buttons.type```.
