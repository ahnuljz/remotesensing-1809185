//// ********************************************************************//// 
// This script was developed to composite image from all Landsat image     //
// collections, which proposed a noval method overcome some limitations    //
// of functions provided by GEE, including simpleComposite, median, min    //
// and so on.                                                              //
// Please use Google Chrome. Other browsers might not work properly.       //
// Author: Jianzhou Li  (leejianzhou2080@gmail.com)                        //
//// ********************************************************************////

//:::::::::::::::::::::::::::::::::::::::: 1. UI ::::::::::::::::::::::::::::::::::::::::
// parameters
var years_ = '2021',
    years = {
        '1982': 1982,
        '1983': 1983,
        '1984': 1984,
        '1985': 1985,
        '1986': 1986,
        '1987': 1987,
        '1988': 1988,
        '1989': 1989,
        '1990': 1990,
        '1991': 1991,
        '1992': 1992,
        '1993': 1993,
        '1994': 1994,
        '1995': 1995,
        '1996': 1996,
        '1997': 1997,
        '1998': 1998,
        '1999': 1999,
        '2000': 2000,
        '2001': 2001,
        '2002': 2002,
        '2003': 2003,
        '2004': 2004,
        '2005': 2005,
        '2006': 2006,
        '2007': 2007,
        '2008': 2008,
        '2009': 2009,
        '2010': 2010,
        '2011': 2011,
        '2012': 2012,
        '2013': 2013,
        '2014': 2014,
        '2015': 2015,
        '2016': 2016,
        '2017': 2017,
        '2018': 2018,
        '2019': 2019,
        '2020': 2020,
        '2021': 2021
    },
    seasons_ = 'Growing season',
    seasons = {
        'Growing season': 1,
        'Non-growing season': 0
    },
    locations_ = 'sample2: Shanghai, CN.',
    bymarker_ = 'By marker...',
    locations = {
        "By marker...": [0, 0, 0, 0],
        "sample1: Wuhu, CN.": [118.336714, 31.298139, 120, 38],
        "sample2: Shanghai, CN.": [120.761318, 31.597141, 119, 38],
        "sample3: Chengdu, CN.": [104.071256, 30.604902, 129, 39],
        "sample4: California, US.": [-119.67173, 36.2919, 42, 35],
        "sample5: Arizona, US.": [-114.607033, 32.551749, 38, 37]
    },
    bandlist = [
        ['RED', 'GREEN', 'BLUE'],
        ['SWIR2', 'SWIR1', 'RED'],
        ['NIR', 'RED', 'GREEN'],
        ['SWIR1', 'NIR', 'BLUE'],
        ['SWIR2', 'SWIR1', 'NIR'],
        ['NIR', 'SWIR1', 'RED'],
        ['SWIR2', 'NIR', 'GREEN'],
        ['SWIR2', 'NIR', 'RED'],
        ['SWIR1', 'NIR', 'RED'],

        '(NIR-RED)/(NIR+RED)', //NDVI
        '(SWIR2-NIR)/(SWIR2+NIR)', //NDBI
        '(GREEN-NIR)/(GREEN+NIR)', //NDWI
        '(RED/NIR - 1) / (RED/NIR + 1)', //NRVI
        '((NIR - SWIR1) / (NIR + SWIR1))', //NDMI
        '2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1))', //EVI
        '(1 + 0.2) * ((NIR - RED) / (NIR + RED + 0.2))', //SAVI

        '(NIR - GREEN) / (NIR + GREEN + 0.16)', //OSAVI
        '0.5*((1+ 2*NIR) - ((1+2*NIR)**2 - 8*(NIR-RED))^0.5)', //MSAVI
        '(SWIR2 - GREEN) / (SWIR2 + GREEN)', //NCI
        '(NIR - GREEN) / (NIR + GREEN)', //NDVIgreen
    ],
    colorlist = [
        ['#FFFFFF', '#D2E0BC', '#D6FF99', '#CAFF7A', '#5Cff5C', '#00FF00', '#00CC00', '#008F00', '#005200'],
        ['#FFFFFF', '#FFFF99', '#FFCA7A', '#FF9D5C', '#FF781F', '#FF6600', '#E05A00', '#E05A00', '#E00000', '#850000'],
        ['#FFFFFF', '#D6D6FF', '#7A7AFF', '#5C5CFF', '#3D3DFF', '#3535E0', '#0000FF', '#0000C2', '#000085', '#000048']
    ],
    types_ = 'RGB_432 (RED/GREEN/BLUE)',
    types = {
        "RGB_432 (RED/GREEN/BLUE)": { band: 0, color: -1 },
        "RGB_764 (SWIR2/SWIR1/RED)": { band: 1, color: -1 },
        "RGB_543 (NIR/RED/GREEN)": { band: 2, color: -1 },
        "RGB_652 (SWIR1/NIR/BLUE)": { band: 3, color: -1 },
        "RGB_765 (SWIR2/SWIR1/NIR)": { band: 4, color: -1 },
        "RGB_564 (NIR/SWIR1/RED)": { band: 5, color: -1 },
        "RGB_753 (SWIR2/NIR/GREEN)": { band: 6, color: -1 },
        "RGB_754 (SWIR2/NIR/RED)": { band: 7, color: -1 },
        "RGB_654 (SWIR1/NIR/RED)": { band: 8, color: -1 },

        "NDVI": { band: 9, color: 0 },
        "NDBI": { band: 10, color: 1 },
        "NDWI": { band: 11, color: 2 },
        "NRVI": { band: 12, color: 0 },
        "NDMI": { band: 13, color: 2 },
        "EVI": { band: 14, color: 0 },
        "SAVI": { band: 15, color: 0 },
        "GOSAVI": { band: 16, color: 0 },
        "GLI": { band: 17, color: 0 }
    },
    methods_ = 'Batch <-> median',
    methods = {
        "Batch <-> median": 'median',
        "Batch <-> simpleComposite": 'simpleComposite',
        "Batch <-> min": 'min',
        "Batch <-> max": 'max',
        "Batch <-> mean": 'mean',
    },
    intro = ui.Panel([
        ui.Label({
            value: 'A Batch Pixel-based Compositing Algorithm',
            style: { fontSize: '20px', fontWeight: 'bold' }
        })
        // ui.Label({
        //   value: 'A noval method to composite image from all Landsat image collection, which overcomes some limitations from simpleComposite or median function.',
        //   style: { fontSize: '14px', fontWeight: 'bold' }
        // }),
        // ui.Label({
        //   value: 'For details of the method, please refer to this article.',
        //   style: { fontSize: '10px' },
        //   targetUrl: 'https://'
        // })
    ]),
    actions_panel = ui.Panel([], ui.Panel.Layout.flow('vertical'), { border: '1px dotted #dddddd' }),
    years_panel = ui.Panel([], ui.Panel.Layout.flow('horizontal')),
    year_select = ui.Select({
        items: Object.keys(years),
        value: years_,
        onChange: function(key) {}
    }),
    season_select = ui.Select({
        items: Object.keys(seasons),
        value: seasons_,
        onChange: function(key) {}
    }),
    location_select = ui.Select({
        items: Object.keys(locations),
        value: locations_,
        onChange: function(key) {
            if (key == bymarker_) {
                btn_composite.setDisabled(true)
                Map.drawingTools().setShown(true);
                Map.drawingTools().setDrawModes(['point']);
                Map.drawingTools().addLayer([]);
                Map.drawingTools().setShape('point');
                Map.drawingTools().draw();
                var drawing = ui.util.debounce(function() {
                    var list = Map.drawingTools().layers().get(0).toGeometry().coordinates();
                    if ("Float" !== ee.Algorithms.ObjectType(list.get(0)).getInfo()) {
                        list = ee.List(list.get(list.size().subtract(1)));
                    }
                    list.evaluate(function(p) {
                        __lbl_lon.setValue(p[0]),
                            __lbl_lat.setValue(p[1]),
                            __LN = p[0],
                            __LT = p[1];
                        btn_composite.setDisabled(false);
                    })
                }, 100);
                Map.drawingTools().onDraw(drawing);
                Map.drawingTools().onEdit(drawing);

                __lbl_lon.setValue(__LN);
                __lbl_lat.setValue(__LT);
            } else {
                btn_composite.setDisabled(false);
                Map.drawingTools().setShown(false);
                Map.drawingTools().onDraw(null);
                Map.drawingTools().onEdit(null);
                __lbl_lon.setValue(locations[key][0]);
                __lbl_lat.setValue(locations[key][1]);
            }
        }
    }),
    type_select = ui.Select({
        items: Object.keys(types),
        value: types_,
        onChange: function(key) {}
    }),
    __LN = 0,
    __LT = 0,
    __lbl_lon = ui.Label({
        value: locations[locations_][0],
        style: { fontSize: '9px', padding: '14px 0 0 0' }
    }),
    __lbl_lat = ui.Label({
        value: locations[locations_][1],
        style: { fontSize: '9px', padding: '14px 0 0 0' }
    }),
    centroid_pl = ui.Panel([
        location_select, __lbl_lon, __lbl_lat
    ], ui.Panel.Layout.flow('horizontal')),
    method_select = ui.Select({
        items: Object.keys(methods),
        value: methods_,
        onChange: function(key) {}
    }),
    txt_img_id = ui.Textbox('reference image id(optinal)', '', null, true, { width: '80%' }),
    get_landsat_by_year = function(year) {
        var sn = 8,
            yy = parseInt(year, 10);
        if (yy <= 1983) {
            sn = 4;
        } else if (yy <= 2000) {
            sn = 5;
        } else if (yy <= 2003) {
            sn = 7;
        } else if (yy < 2012) {
            sn = 5;
        } else if (yy == 2012) {
            sn = 7;
        } else if (yy >= 2013) {
            sn = 8;
        }
        return sn;
    },
    linkedMap = ui.Map(),
    panel = ui.Panel(),
    wrs = ee.FeatureCollection("users/leejianzhou2080/WRS2_descending_0");

// button action
var btn_composite = ui.Button({
    label: ' APPLY ',
    style: { color: '#e74c3c', fontWeight: 'bold' },
    onClick: function() {
        var _checkbox = _use_id.getValue(),
            _image_id = txt_img_id.getValue(),
            _year = year_select.getValue(),
            _season = season_select.getValue(),
            _location = location_select.getValue(),
            _type = type_select.getValue(),
            _method = method_select.getValue(),
            selected_year = years[_year],
            selected_season = seasons[_season],
            selected_location = locations[_location],
            selected_type = types[_type],
            selected_method = methods[_method],
            lon = selected_location[0],
            lat = selected_location[1],
            path = selected_location[2],
            row = selected_location[3],
            zoom = Map.getZoom();

        if (_checkbox && !_image_id) {
            alert("no image id available if you use your own reference.");
            return;
        }

        zoom = zoom >= 8 ? zoom : 11;
        if (!path) {
            var l = __LN,
                t = __LT;
            if (!l || !t) {
                alert("lon/lat undefined. draw a marker and try again.");
                return;
            }
            var p = ee.Geometry.Point(l, t),
                w = wrs.filterBounds(p).first();
            path = w.get("PATH")
            row = w.get("ROW")
            Map.centerObject(p, zoom);
        } else {
            Map.setCenter(lon, lat, zoom)
        }

        var ref, compare, ref_vis, com_vis, _bands, ref_stat, compare_stat, _t = 'nd',
            percentile = [0.3, 99.7],
            _sensor = get_landsat_by_year(selected_year),
            _reducer = {
                reducer: ee.Reducer.percentile(percentile),
                geometry: Map.getBounds(true),
                scale: Map.getScale() * 5,
                maxPixels: 1e8
            };

        ref = referenceComposite(_image_id, _sensor, selected_year, selected_season, path, row, 30);
        compare = geeComposite(_sensor, selected_year, selected_season, path, row, selected_method)
        if (!ref || !compare) return;

        linkedMap.clear();
        Map.clear();

        if (selected_type.color >= 0) { //gray image
            var _ex = bandlist[selected_type.band],
                _bands = [_t];
            ref = ref.expression(_ex, {
                'NIR': ref.select('NIR'),
                'RED': ref.select('RED'),
                'BLUE': ref.select('BLUE'),
                'SWIR1': ref.select('SWIR1'),
                'SWIR2': ref.select('SWIR2'),
                'GREEN': ref.select('GREEN'),
                'L': 0.2
            }).select(0).rename(_t);
            compare = compare.expression(_ex, {
                'NIR': compare.select('NIR'),
                'RED': compare.select('RED'),
                'BLUE': compare.select('BLUE'),
                'SWIR1': compare.select('SWIR1'),
                'SWIR2': compare.select('SWIR2'),
                'GREEN': compare.select('GREEN'),
                'L': 0.2
            }).select(0).rename(_t);

            ref_stat = ref.select(_bands).reduceRegion(_reducer).values().reduce(ee.Reducer.minMax()).getInfo();
            compare_stat = compare.select(_bands).reduceRegion(_reducer).values().reduce(ee.Reducer.minMax()).getInfo();
            ref_vis = { min: ref_stat.min, max: ref_stat.max, palette: colorlist[selected_type.color] };
            com_vis = { min: compare_stat.min, max: compare_stat.max, palette: colorlist[selected_type.color] };
        } else { //color image
            _bands = bandlist[selected_type.band];

            ref_stat = ref.select(_bands).reduceRegion(_reducer).values().reduce(ee.Reducer.minMax()).getInfo();
            compare_stat = compare.select(_bands).reduceRegion(_reducer).values().reduce(ee.Reducer.minMax()).getInfo();
            ref_vis = { bands: _bands, min: ref_stat.min, max: ref_stat.max };
            com_vis = { bands: _bands, min: compare_stat.min, max: compare_stat.max };
        }

        Map.addLayer(ref, ref_vis, 'Reference-' + _type);
        linkedMap.addLayer(compare, com_vis, selected_method + '-' + _type);
    }
});
var _use_id = ui.Checkbox('specify the reference image:', false, function(c) {
    txt_img_id.setDisabled(!c)
})

years_panel.add(year_select);
years_panel.add(season_select);
actions_panel.add(ui.Label({ value: '1) Select date range:', style: { fontWeight: 'bold' } }))
actions_panel.add(years_panel);
actions_panel.add(ui.Label({ value: '2) Select a location.', style: { fontWeight: 'bold' } }));
actions_panel.add(centroid_pl);
actions_panel.add(ui.Label({ value: '3) Select data for visualization.', style: { fontWeight: 'bold' } }));
actions_panel.add(type_select);
actions_panel.add(ui.Label({ value: '4) Select a comparison pair.', style: { fontWeight: 'bold' } }));
actions_panel.add(method_select);
actions_panel.add(_use_id);
actions_panel.add(txt_img_id);
actions_panel.add(btn_composite);

panel.style().set('width', '20%');
panel.add(intro);
panel.add(actions_panel);
// panel.add(ui.Label('Note:  The left side is produced by the referenced based method, and it may be exported to Google Drive or cloud storage.', { fontSize: '10px' }));

var linker = ui.Map.Linker([ui.root.widgets().get(0), linkedMap]);
var splitPanel = ui.SplitPanel({
    firstPanel: linker.get(0),
    secondPanel: linker.get(1),
    orientation: 'horizontal',
    wipe: true,
    style: { stretch: 'both' }
});
ui.root.widgets().reset([splitPanel]);
ui.root.insert(0, panel);
Map.drawingTools().setShown(false);
Map.drawingTools().setLinked(false);

//refresh the location lbl display
function changelbl(p) {
    __lbl_lon.setValue(p[0]),
        __lbl_lat.setValue(p[1]),
        __LN = p[0],
        __LT = p[1];
    btn_composite.setDisabled(false);
}

//:::::::::::::::::::::::::::::::::::::::: 2. Algorithm ::::::::::::::::::::::::::::::::::::::::
// generate reference image
function get_reference_image(_image_id, sensor, year, season, wrs_path, wrs_row) {
    if (_image_id) {
        return ee.Image(_image_id);
    }

    var sts = "system:time_start",
        filter1, filter2, filter3, filter4, filter5, filter6, filter7, filter8, filterD, filterQ, ic;
    if (wrs_row >= 75 && wrs_row < 247) { // south semisphere regions
        if (season == 1) { // growing season
            filter1 = ee.Filter.gte(sts, ee.Date(year + '-01-01').millis())
            filter2 = ee.Filter.lt(sts, ee.Date(year + '-04-01').millis())
            filter3 = ee.Filter.gte(sts, ee.Date(year + '-10-01').millis())
            filter4 = ee.Filter.lte(sts, ee.Date(year + '-12-31').millis())
            filterD = ee.Filter.or(ee.Filter.and(filter1, filter2), ee.Filter.and(filter3, filter4))
        } else {
            filter1 = ee.Filter.gte(sts, ee.Date(year + '-04-01').millis())
            filter2 = ee.Filter.lt(sts, ee.Date(year + '-10-01').millis())
            filterD = ee.Filter.and(filter1, filter2)
        }
    } else if (wrs_row <= 45) { // north semisphere regions
        if (season == 1) {
            filter5 = ee.Filter.gte(sts, ee.Date(year + '-04-01').millis())
            filter6 = ee.Filter.lt(sts, ee.Date(year + '-10-01').millis())
            filterD = ee.Filter.and(filter5, filter6)
        } else { // Tropical regions  & polar region
            filter1 = ee.Filter.gte(sts, ee.Date(year + '-01-01').millis())
            filter2 = ee.Filter.lt(sts, ee.Date(year + '-04-01').millis())
            filter3 = ee.Filter.gte(sts, ee.Date(year + '-10-01').millis())
            filter4 = ee.Filter.lte(sts, ee.Date(year + '-12-31').millis())
            filterD = ee.Filter.or(ee.Filter.and(filter1, filter2), ee.Filter.and(filter3, filter4))
        }
    } else {
        filter7 = ee.Filter.gte(sts, ee.Date(year + '-01-01').millis())
        filter8 = ee.Filter.lte(sts, ee.Date(year + '-12-31').millis())
        filterD = ee.Filter.and(filter7, filter8)
    }

    ic = sensor ? landsat_collections(sensor) : all_landsat_collections()
    filterQ = ee.Filter.gte(sensor == 8 ? "IMAGE_QUALITY_OLI" : "IMAGE_QUALITY", 5)

    var ref = ic
        .filterMetadata("WRS_PATH", "equals", wrs_path)
        .filterMetadata("WRS_ROW", "equals", wrs_row)
        .filter(filterD)
        .filter(filterQ)
        .sort("CLOUD_COVER", true)
    var size = ref.size().getInfo()

    // if reference image for specific season is unavailable, use the whole year scope instead.
    if (size == 0) {
        ref = ic
            .filterMetadata("WRS_PATH", "equals", wrs_path)
            .filterMetadata("WRS_ROW", "equals", wrs_row)
            .filter(filterD)
            .sort("CLOUD_COVER", true)
        size = ref.size().getInfo()
        print("downgrade refer size:", size)
    }
    return size == 0 ? null : ref.first()
}

// score all images
function map_calc_score(image) {
    var cloud0, doy0, year0, month0, day0, sensor0, season0,
        cloud, doy, year, month, day, sensor, season,
        v_quality, v_sensor, v_season, v_doy, v_cloud, v_year, v_add, v_five, score,
        quality_tm, quality_oli, quality, gt4, lt10, d1, d2, diff, _scene, _system;

    cloud0 = ee.Number(image.get("cloud0"))
    doy0 = ee.Number(image.get("doy0")).toInt()
    year0 = ee.Number(image.get("year0")).toInt()
    month0 = ee.Number(image.get("month0")).toInt()
    day0 = ee.Number(image.get("day0")).toInt()
    sensor0 = ee.Number(image.get("sensor0")).toInt()
    season0 = ee.Number(image.get("season0")).toInt()

    quality_tm = ee.Number(image.get("IMAGE_QUALITY"))
    quality_oli = ee.Number(image.get("IMAGE_QUALITY_OLI"))
    quality = quality_oli ? quality_oli : quality_tm
    v_quality = quality.gte(5) ? ee.Number(1) : ee.Number(0)
    cloud = ee.Number(image.get("CLOUD_COVER"))
    _scene = ee.String(image.get("LANDSAT_SCENE_ID"))
    _system = ee.String(image.get("system:index"))

    sensor = ee.Number.parse(_scene.slice(2, 3)).toInt()
    year = ee.Number.parse(_scene.slice(9, 13)).toInt()
    month = ee.Number.parse(_system.slice(16, 18)).toInt()
    day = ee.Number.parse(_system.slice(18, 20)).toInt()
    doy = ee.Number.parse(_scene.slice(13, 16)).toInt()
    gt4 = month.gte(4)
    lt10 = month.lt(10)
    season = ee.Algorithms.If(gt4.add(lt10).eq(2), 1, 0)

    d1 = ee.Date.fromYMD(year, month, day)
    d2 = ee.Date.fromYMD(year0, month0, day0)
    diff = d1.difference(d2, 'day')

    // compute score
    v_sensor = ee.Number.parse(ee.Algorithms.String(ee.Algorithms.If(ee.Algorithms.IsEqual(sensor0, sensor), 1, 0)))
    v_season = ee.Number.parse(ee.Algorithms.String(ee.Algorithms.If(ee.Algorithms.IsEqual(season0, season), 1, 0)))
    v_doy = ee.Number(1).subtract(ee.Number(doy.subtract(doy0)).abs().divide(365)).pow(2)
    v_cloud = ee.Number(1).subtract(ee.Number(cloud.subtract(cloud0)).abs().divide(100)).pow(2)
    v_year = ee.Number(0.2).pow(ee.Number(year.subtract(year0)).abs())
    v_add = v_sensor.add(v_season).add(v_doy).add(v_cloud).add(v_year)
    v_five = ee.Number(ee.Number(5)).sqrt()
    score = ee.Number(v_add).sqrt().divide(v_five).multiply(v_quality)

    image = image.set(
        "score", score,
        "v_sensor", v_sensor,
        "v_season", v_season,
        "v_doy", v_doy,
        "v_cloud", v_cloud,
        "v_year", v_year,
        "v_quality", v_quality,
        "year", year,
        "year0", year0,
        "month", month,
        "month0", month0,
        "day", day,
        "day0", day0,
        "season", season,
        "season0", season0,
        "quality", quality,
        "cloud", cloud,
        "cloud0", cloud0,
        "sensor", sensor,
        "sensor0", sensor0,
        "doy", doy,
        "doy0", doy0,
        "diff", diff,
        "id", _system
    )
    var scoreBand = ee.Image(score).float().rename("score")
    var diffBand = ee.Image(diff).float().rename("diff")
    return image.addBands(scoreBand).addBands(diffBand)
}

// composite
function referenceComposite(_image_id, sensor, year, season, wrs_path, wrs_row, limit) {
    year = (season == 0 && year == 2013) ? 2014 : year;
    var reference = get_reference_image(_image_id, sensor, year, season, wrs_path, wrs_row)
    if (!reference) {
        print("err: no images matched. ")
        return
    }

    var sts = "system:time_start",
        cloud0 = reference.get("CLOUD_COVER"),
        footprint = reference.get("system:footprint"),
        _scene = reference.get("LANDSAT_SCENE_ID").getInfo(),
        _system = reference.get("system:index").getInfo(),
        doy0 = _scene.substring(13, 16) - 0,
        year0 = _scene.substring(9, 13) - 0,
        month0 = _system.substring(16, 18) - 0,
        day0 = _system.substring(18, 20) - 0,
        sensor0 = _scene.substring(2, 3) - 0,
        ic = sensor ? landsat_collections(sensor) : all_landsat_collections(),
        filterQ = ee.Filter.gte(sensor == 8 ? "IMAGE_QUALITY_OLI" : "IMAGE_QUALITY", 5),
        filter1 = ee.Filter.gte(sts, ee.Date.fromYMD(year - 1, 1, 1).millis()),
        filter2 = ee.Filter.lte(sts, ee.Date.fromYMD(year + 1, 12, 31).millis()),
        filterD = ee.Filter.and(filter1, filter2),
        map_add_ref_para = function(img) {
            img = img.set('doy0', doy0, 'year0', year0, 'month0', month0, 'day0', day0, 'season0', season, 'sensor0', sensor0, 'cloud0', cloud0)
            return img
        };

    var collection = ic
        .filterMetadata("WRS_PATH", "equals", wrs_path)
        .filterMetadata("WRS_ROW", "equals", wrs_row)
        .filter(filterD)
        .filter(filterQ)
        .map(map_add_ref_para)
        .map(map_calc_score).sort("CLOUD_COVER", true);

    // var n = collection.size().getInfo() - 0;
    // var list = collection.toList(n);
    // for (var i = 0; i < 10; i++) {
    //   var im = ee.Image(list.get(i))
    //   var dic = im.toDictionary(im.propertyNames())
    //   print(dic)
    // }

    var ref = collection.map(landsat_cloud_mask_simple).qualityMosaic('score')
        // var median = collection.map(landsat_cloud_mask_simple).median()
        // var tmp =median.updateMask(ref.select(0).unmask(-1).eq(-1)).unmask(0)
        // ref =  getClipped(ref.unmask(0).add(tmp).set("system:footprint", footprint));
    ref = getClipped(ref.set("system:footprint", footprint));
    return ref;
}

//composite by methods provided by google earth engine.
function geeComposite(sensor, year, season, wrs_path, wrs_row, method) {
    var sts = "system:time_start",
        year = (season == 0 && year == 2013) ? 2014 : year,
        filter1, filter2, filter3, filter4, filter5, filter6, filter7, filter8, filterD, filterQ, ic;
    // south semisphere regions
    if (wrs_row >= 75 && wrs_row < 247) {
        // growing season
        if (season == 1) {
            filter1 = ee.Filter.gte(sts, ee.Date(year + '-01-01').millis())
            filter2 = ee.Filter.lt(sts, ee.Date(year + '-04-01').millis())
            filter3 = ee.Filter.gte(sts, ee.Date(year + '-10-01').millis())
            filter4 = ee.Filter.lte(sts, ee.Date(year + '-12-31').millis())
            filterD = ee.Filter.or(ee.Filter.and(filter1, filter2), ee.Filter.and(filter3, filter4))
        } else {
            filter1 = ee.Filter.gte(sts, ee.Date(year + '-04-01').millis())
            filter2 = ee.Filter.lt(sts, ee.Date(year + '-10-01').millis())
            filterD = ee.Filter.and(filter1, filter2)
        }
        // north semisphere regions
    } else if (wrs_row <= 45) {
        if (season == 1) {
            filter5 = ee.Filter.gte(sts, ee.Date(year + '-04-01').millis())
            filter6 = ee.Filter.lt(sts, ee.Date(year + '-10-01').millis())
            filterD = ee.Filter.and(filter5, filter6)
                // Tropical regions  & polar region
        } else {
            filter1 = ee.Filter.gte(sts, ee.Date(year + '-01-01').millis())
            filter2 = ee.Filter.lt(sts, ee.Date(year + '-04-01').millis())
            filter3 = ee.Filter.gte(sts, ee.Date(year + '-10-01').millis())
            filter4 = ee.Filter.lte(sts, ee.Date(year + '-12-31').millis())
            filterD = ee.Filter.or(ee.Filter.and(filter1, filter2), ee.Filter.and(filter3, filter4))
        }
    } else {
        filter7 = ee.Filter.gte(sts, ee.Date(year + '-01-01').millis())
        filter8 = ee.Filter.lte(sts, ee.Date(year + '-12-31').millis())
        filterD = ee.Filter.and(filter7, filter8)
    }

    ic = sensor ? landsat_collections(sensor) : all_landsat_collections()
    filterQ = ee.Filter.gte(sensor == 8 ? "IMAGE_QUALITY_OLI" : "IMAGE_QUALITY", 5)

    var mosaic;
    if (method !== 'simpleComposite') {
        var imgs_init = ic
            .filterMetadata("WRS_PATH", "equals", wrs_path)
            .filterMetadata("WRS_ROW", "equals", wrs_row)
            .filter(filterD)
            .filter(filterQ)
            .map(landsat_cloud_mask_simple),
            footprint = imgs_init.first().get("system:footprint");
        if (method == 'median' || !method) {
            mosaic = getClipped(imgs_init.median().set("system:footprint", footprint))
        } else if (method == 'max') {
            mosaic = getClipped(imgs_init.max().set("system:footprint", footprint))
        } else if (method == 'min') {
            mosaic = getClipped(imgs_init.min().set("system:footprint", footprint))
        } else if (method == 'mean') {
            mosaic = getClipped(imgs_init.mean().set("system:footprint", footprint))
        } else {
            print('method not supported.')
        }
    } else {
        var simple = landsat_collections_raw(sensor)
            .filterMetadata("WRS_PATH", "equals", wrs_path)
            .filterMetadata("WRS_ROW", "equals", wrs_row)
            .filter(filterD)
            .filter(filterQ)
            .map(landsat_cloud_mask_simple),
            footprint = simple.first().get("system:footprint"),
            tmp = ee.Algorithms.Landsat.simpleComposite(simple);
        tmp = rename_bands_raw(tmp, sensor);
        mosaic = getClipped(tmp.set("system:footprint", footprint))
    }

    return mosaic
}

//:::::::::::::::::::::::::::::::::::::::: 3. Basic ::::::::::::::::::::::::::::::::::::::::
// basic functions
var _qa_dic = {
        "LANDSAT_8": ee.Image([2800, 2804, 2808, 2812, 6896, 6900, 6904, 6908, 2976, 2980, 2984, 2988, 3008, 3012, 3016, 3020, 7072, 7076, 7080, 7084, 7104, 7108, 7112, 7116]),
        "LANDSAT_7": ee.Image([752, 756, 760, 764, 928, 932, 936, 940, 960, 964, 968, 972]),
        "LANDSAT_5": ee.Image([752, 756, 760, 764, 928, 932, 936, 940, 960, 964, 968, 972]),
        "LANDSAT_4": ee.Image([752, 756, 760, 764, 928, 932, 936, 940, 960, 964, 968, 972])
    },
    landsat_toa = {
        "l4": "LANDSAT/LT04/C01/T1_TOA",
        "l5": "LANDSAT/LT05/C01/T1_TOA",
        "l7": "LANDSAT/LE07/C01/T1_TOA",
        "l8": "LANDSAT/LC08/C01/T1_TOA"
    },
    landsat_raw = {
        "l4": "LANDSAT/LT04/C01/T1",
        "l5": "LANDSAT/LT05/C01/T1",
        "l7": "LANDSAT/LE07/C01/T1",
        "l8": "LANDSAT/LC08/C01/T1"
    },
    bands_rename_raw = {
        '8': [
            ['B2', 'B3', 'B4', 'B5', 'B6', 'B7'],
            ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
        ],
        '7': [
            ['B1', 'B2', 'B3', 'B4', 'B5', 'B7'],
            ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
        ],
        '5': [
            ['B1', 'B2', 'B3', 'B4', 'B5', 'B7'],
            ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
        ],
        '4': [
            ['B1', 'B2', 'B3', 'B4', 'B5', 'B7'],
            ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2']
        ],
    },
    bands_rename_toa = [
        ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', "BQA", "cloud"],
        ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2', "BQA", "cloud"],
        ['B1', 'B2', 'B3', 'B4', 'B5', 'B7', "BQA", "cloud"],
        ['BLUE', 'GREEN', 'RED', 'NIR', 'SWIR1', 'SWIR2', "BQA", "cloud"]
    ];

function landsat_cloud_mask(image) {
    var max_cloud_score = ee.Number(20),
        qa_dic = ee.Dictionary(_qa_dic),
        spaceid = image.get("SPACECRAFT_ID");
    return image.updateMask(image.select("BQA").eq(qa_dic.get(spaceid)).reduce("max").not()).updateMask(image.select("cloud").lte(max_cloud_score))
}

function landsat_cloud_mask_simple(image) {
    var qa_dic = ee.Dictionary(_qa_dic),
        spaceid = image.get("SPACECRAFT_ID");
    return image.updateMask(image.select("BQA").eq(qa_dic.get(spaceid)).reduce("max").not())
}

function getClipped(img) {
    var MOVE_STEP = 0.02,
        footprint = ee.Geometry(img.get('system:footprint')),
        coordinates = footprint.coordinates(),
        lon = coordinates.map(function(p) {
            return ee.List(p).get(0)
        }),
        dic = ee.Dictionary(lon.reduce(ee.Reducer.minMax())),
        offset = ee.Number(dic.get("max")).subtract(ee.Number(dic.get("min"))).multiply(MOVE_STEP),
        move_right = coordinates.map(function(p) {
            return [ee.Number(ee.List(p).get(0)).add(offset), ee.List(p).get(1)]
        }),
        move_left = coordinates.map(function(p) {
            return [ee.Number(ee.List(p).get(0)).subtract(offset), ee.List(p).get(1)]
        }),
        hull = footprint.convexHull(),
        inter_right = hull.intersection(ee.Geometry.LinearRing(move_right).convexHull()),
        inter_left = hull.intersection(ee.Geometry.LinearRing(move_left).convexHull())
    return img.clip(inter_right.intersection(inter_left));
}

function all_landsat_collections() {
    var lc8 = ee.ImageCollection(landsat_toa["l8"]).map(rename_bands_oli).set("SENSOR_ID", "OLI_TIRS")
    var lc7 = ee.ImageCollection(landsat_toa["l7"]).map(rename_bands_tm).set("SENSOR_ID", "ETM+")
    var lc5 = ee.ImageCollection(landsat_toa["l5"]).map(rename_bands_tm).set("SENSOR_ID", "TM")
    var lc4 = ee.ImageCollection(landsat_toa["l4"]).map(rename_bands_tm).set("SENSOR_ID", "TM")
    return lc8.merge(lc7).merge(lc5).merge(lc4)
}

function landsat_collections(n) {
    var ic;
    if (n == 8) {
        ic = ee.ImageCollection(landsat_toa["l8"]).map(rename_bands_oli)
    } else if (n == 7) {
        ic = ee.ImageCollection(landsat_toa["l7"]).map(rename_bands_tm)
    } else if (n == 5) {
        ic = ee.ImageCollection(landsat_toa["l5"]).map(rename_bands_tm)
    } else if (n == 4) {
        ic = ee.ImageCollection(landsat_toa["l4"]).map(rename_bands_tm)
    }
    return ic
}

function landsat_collections_raw(n) {
    var ic;
    if (n == 8) {
        ic = ee.ImageCollection(landsat_raw["l8"])
    } else if (n == 7) {
        ic = ee.ImageCollection(landsat_raw["l7"])
    } else if (n == 5) {
        ic = ee.ImageCollection(landsat_raw["l5"])
    } else if (n == 4) {
        ic = ee.ImageCollection(landsat_raw["l4"])
    }
    return ic
}

function rename_bands_raw(image, sensor) {
    return image.select(bands_rename_raw['' + sensor][0]).rename(bands_rename_raw['' + sensor][1])
}

function rename_bands_tm(image) {
    var scored, bands, new_bands;
    scored = ee.Algorithms.Landsat.simpleCloudScore(image)
    return scored.select(bands_rename_toa[2]).rename(bands_rename_toa[3])
}

function rename_bands_oli(image) {
    var scored, bands, new_bands;
    scored = ee.Algorithms.Landsat.simpleCloudScore(image)
    return scored.select(bands_rename_toa[0]).rename(bands_rename_toa[1])
}

// exports.referenceComposite = referenceComposite;


// var delta = ee.FeatureCollection('users/leejianzhou2080/2019/city')
//             .filter(ee.Filter.or(ee.Filter.eq('省','安徽省'),ee.Filter.eq('省','江苏省'),ee.Filter.eq('省','上海市'),ee.Filter.eq('省','浙江省')));
// Map.addLayer(delta, { color: '000000' }, 'yzriver');
// Map.centerObject(delta,8);
// var wrs = ee.FeatureCollection('users/leejianzhou2080/WRS2_descending_0')
//           .filterBounds(delta)
//           .map(function(ff){
//               var path = ff.get("PATH"),row=ff.get("ROW");
//               return referenceComposite(0, 8, 2020, 1, path, row, 30);
//             });
// print(wrs)