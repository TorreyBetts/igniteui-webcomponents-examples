let gulp = require('gulp');
let gulpIgnore = require('gulp-ignore');
let uglify = require('gulp-uglify');

// let gSort = require('gulp-sort');
let rename = require('gulp-rename');
let fs = require('fs.extra');
let path = require('path');
let flatten = require('gulp-flatten');
let del = require('del');
let es = require('event-stream');
let shell = require('gulp-shell');
let replace = require('gulp-replace');
let contains = require('gulp-contains');

var igConfig = require('./gulp-config.js')
// var platform = "React";
// var igConfig = require('./gulp-config.js')[platform];

eval(require('typescript')
.transpile(require('fs')
.readFileSync("./tasks/Transformer.ts").toString()));

function log(msg) {
    console.log('gulp-samples.js ' + msg);
}
log('loaded');

// NOTE you can comment out strings in this array to run subset of samples
var sampleSources = [
    // charts:
    igConfig.SamplesCopyPath + '/charts/category-chart/**/package.json',
    // igConfig.SamplesCopyPath + '/charts/data-chart/**/package.json',
    // igConfig.SamplesCopyPath + '/charts/doughnut-chart/**/package.json',
    // igConfig.SamplesCopyPath + '/charts/financial-chart/**/package.json',
    // igConfig.SamplesCopyPath + '/charts/pie-chart/**/package.json',
    // igConfig.SamplesCopyPath + '/charts/sparkline/**/package.json',
    // igConfig.SamplesCopyPath + '/charts/tree-map/**/package.json',
    // igConfig.SamplesCopyPath + '/charts/zoomslider/**/package.json',
    // // // maps:
    // igConfig.SamplesCopyPath + '/maps/**/package.json',
    // // // excel:
    // igConfig.SamplesCopyPath + '/excel/excel-library/**/package.json',
    // igConfig.SamplesCopyPath + '/excel/spreadsheet/**/package.json',
    // // gauges:
    // igConfig.SamplesCopyPath + '/gauges/bullet-graph/**/package.json',
    // igConfig.SamplesCopyPath + '/gauges/linear-gauge/**/package.json',
    // igConfig.SamplesCopyPath + '/gauges/radial-gauge/**/package.json',
    // // // grids:
    // igConfig.SamplesCopyPath + '/grids/**/package.json',
    // // layouts:
    // igConfig.SamplesCopyPath + '/layouts/**/package.json',

     '!' + igConfig.SamplesCopyPath + '/**/node_modules/**/package.json',
     '!' + igConfig.SamplesCopyPath + '/**/node_modules/**',
     '!' + igConfig.SamplesCopyPath + '/**/node_modules',
];

// this variable stores detailed information about all samples in ./samples/ folder
var samples = [];

var sampleOutputFolder = '';
// var sampleOutputFolder = './sample-test-files/';

function cleanSamples() {
    // cleaning up obsolete files in individual samples
    del.sync("./samples/**/src/sandbox.config.json", {force:true});
    del.sync("./samples/**/manifest.json", {force:true});
}

function lintSamples(cb) {

    // del.sync("./sample-test-files/**/*.*", {force:true}); LinearGaugeLabels.tsx

    gulp.src([
        // './samples/tests2/**/**/LinearGaugeLabels.tsx',
        // './samples/gauges/**/**/*.tsx',
        './templates/**/**/*.ts',
        // './templates/**/**/*.ts',
        // './samples/**/**/**/*.tsx',
       '!./samples/**/**/**/index.ts',
    ], {base: './'})
    // .pipe(gSort( { asc: false } ))
    .pipe(es.map(function(file, fileCallback) {

        let fileLocation = Transformer.getRelative(file.dirname) + '/' + file.basename;
        let fileContent = file.contents.toString();
        // log('linting ' + fileLocation);

        let newContent = Transformer.lintSample(fileLocation, fileContent,
            (err, results) => {
              if (err) {
                fileCallback(err, null);
              }
            //   file.contents = Buffer.from(results);
            //   fileCallback(null, file);
            });
        if (newContent !== fileContent) {
            log('changed: ' + fileLocation);
            file.contents = Buffer.from(newContent);
            // fileCallback(null, file);
        } else {
            // fileCallback(null, null);
        }
        fileCallback(null, file);
    }))
    .pipe(gulp.dest('./'))
    .on("end", function() {
        cb();
    });
} exports.lintSamples = lintSamples;


function getSamplesTest(cb) {
    gulp.src(sampleSources)
    .pipe(es.map(function(samplePackage, sampleCallback) {
    }))
    .on("end", function() {
         cb();
    });

} exports.getSamplesTest = getSamplesTest;

function getSamples(cb) {

    // deleteSamples();
    cleanSamples();

    samples = [];
    // del.sync("./sample-test-files/**/*.*", {force:true});

    gulp.src(sampleSources)
    // .pipe(gSort( { asc: false } ))
    .pipe(es.map(function(samplePackage, sampleCallback) {

        let SampleFolderName = Transformer.getRelative(samplePackage.dirname);
        log("getSamples " + SampleFolderName);

        let sampleFiles = [];
        gulp.src([
              SampleFolderName + "/package.json",
              SampleFolderName + "/index.html",
              SampleFolderName + "/src/**",
        '!' + SampleFolderName + "/src/index.ts",
        //       SampleFolderName + "/**",
        // '!' + SampleFolderName + "/package-lock.json",
        // '!' + SampleFolderName + "/sandbox.config.json",
        // '!' + SampleFolderName + "/node_modules/**",
        ])
        // .pipe(flatten({ "includeParents": -1 }))
        .pipe(es.map(function(file, fileCallback) {
            let fileDir = Transformer.getRelative(file.dirname);
            let filePath = fileDir + "/" + file.basename;
            sampleFiles.push(filePath);
            log("getSamples " + filePath );
            fileCallback(null, file);
        }))
        .on("end", function() {
             log("getSamples " + SampleFolderName + " " + sampleFiles.length + " files" );

            let sampleInfo = Transformer.getSampleInfo(samplePackage, sampleFiles);
            samples.push(sampleInfo);

            sampleCallback(null, samplePackage);
        });

        // sampleCallback(null, sample);
    }))
    .on("end", function() {
        log('getSamples found ' + samples.length + " samples");
        Transformer.sort(samples);
        Transformer.process(samples);

        //Transformer.verify(samples);
        //Transformer.print(samples);
        //Transformer.getGroups(samples);
        // log('getSamples found ' + samples.length + " samples");
        // for (const sample of samples) {
        //     log(' ' + sample.SampleFolderPath);
        // }
        // let last = samples[samples.length - 1];
        // log('package name ' + last.PackageFileContent.name);
        // last.PackageDependencies = Transformer.getDependencies(last);
        // log('packages \n' + last.PackageFileContent.dependencies);
        // log('dependencies: \n' + last.PackageDependencies);
        cb();
    });

} exports.getSamples = getSamples;

function makeDirectoryFor(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    makeDirectoryFor(dirname);
    fs.mkdirSync(dirname);
    // fs.mkdir(sampleOutputFolder + 'src', { recursive: true }, (err) => { if (err) throw err; });
}

function copyExclude(files) {
    return es.map(function(file, cb) {
        if (files.indexOf(file.basename) >= 0) {
            // log('+ share data ' + file.basename);
            cb(null, file);
        } else {
            // log('- share data ' + file.basename);
            cb(null);
        }
    });
}

function deleteSamples() {
    log('deleting sample files... ');
    del.sync("./src/samples/**/*.*", {force:true});
    del.sync("./src/samples/*.*", {force:true});
    del.sync("./src/samples/*", {force:true});
}

function copySamples(cb) {

    deleteSamples();
    log('copying sample files... ');
    for (const sample of samples) {
        console.log('copying ' + sample.SampleFolderPath + '/' + sample.SampleFileName);

        // let outputPath = sample.SampleFolderPath;
        let outputPath = './src' + sample.SampleFolderPath.replace('..','');
        // let outputPath = './sample-test-files' + sample.SampleFolderPath.replace('.','');
        // log(outputPath);
        // let outputPath = sampleOutputFolder + '/' + sample.SampleFolderPath;

        gulp.src([
            //   sample.SampleFolderPath + '/**/*.*',
              sample.SampleFolderPath + '/src/*.*',
        '!' + sample.SampleFolderPath + '/src/index.css',
        '!' + sample.SampleFolderPath + '/src/index.ts',
        '!' + sample.SampleFolderPath + '/src/typedecls.d.ts',
        // '!' + sample.SampleFolderPath + '/sandbox.config.json',
        // '!' + sample.SampleFolderPath + '/README.md',
        // '!' + sample.SampleFolderPath + '/ReadMe.md',
        // '!' + sample.SampleFolderPath + '/readme.md',
        // '!' + sample.SampleFolderPath + '/package.json',
        // '!' + sample.SampleFolderPath + '/package-lock.json',
        ])
        // .pipe(copyExclude(['ReadMe.md', 'index.tsx']))
        // .pipe(logFile())
        .pipe(gulp.dest(outputPath))

        // break;
    }

    let routingGroups = Transformer.getRoutingGroups(samples);
    let routerTemplate = fs.readFileSync("./templates/browser/src/router.ts", "utf8");
    for (const group of routingGroups) {
        let outputPath = "./src/samples/" + group.Name + "/router.ts";
        makeDirectoryFor(outputPath);

        // log('created ' + outputPath);
        let routingFile = Transformer.getRoutingFile(group, routerTemplate);
        fs.writeFileSync(outputPath, routingFile);
    }

    cb();
} exports.copySamples = copySamples;

function updateReadme(cb) {

    // log('updating readme files... ');
    var template = fs.readFileSync("./templates/sample/ReadMe.md", "utf8");
    for (const sample of samples) {

        // let outputPath = sampleOutputFolder + '/' + sample.SampleFolderPath;
        let outputPath = sampleOutputFolder + sample.SampleFolderPath + "/ReadMe.md";
        makeDirectoryFor(outputPath);
        // log(outputPath);
        let readmeFile = Transformer.updateReadme(sample, template);
        fs.writeFileSync(outputPath, readmeFile);
        // break;
    }
    cb();
} exports.updateReadme = updateReadme;

// updating package.json files for all sample using a template
function updatePackages(cb) {

    // getting content of package.json file from templates
    let templatePackageFile = fs.readFileSync("./templates/sample/package.json");
    let templatePackageJson = JSON.parse(templatePackageFile.toString());

    // let last = samples[samples.length - 1];
    // let content = Transformer.getPackage(last, templatePackageJson);
    // fs.writeFileSync(sampleOutputFolder + "package.json", content);

    for (const sample of samples) {
        let outputPath = sampleOutputFolder + sample.SampleFolderPath + "/package.json";
        let oldPackageFile = fs.readFileSync(outputPath).toString();

        makeDirectoryFor(outputPath);

        let newPackageFile = Transformer.getPackage(sample, templatePackageJson);
        if (newPackageFile !== oldPackageFile) {
            log('updated: ' + outputPath);
            fs.writeFileSync(outputPath, newPackageFile);
        }
    }

    cb();
} exports.updatePackages = updatePackages;

// updating browser's package.json file using template's package.json
function copyPackageJson(cb) {

    // getting content of package.json file from templates
    let templatePackageFile = fs.readFileSync("./templates/sample/package.json");
    let templatePackageJson = JSON.parse(templatePackageFile.toString());

    // getting content of package.json file from the browser
    let browserPackageFile = fs.readFileSync("./package.json");
    let browserPackageJson = JSON.parse(browserPackageFile.toString());

    let browserPackageNew = Transformer.updatePackage(browserPackageJson, templatePackageJson);
    if (browserPackageNew !== browserPackageFile) {
        fs.writeFileSync(sampleOutputFolder + "package.json", browserPackageNew);
        // console.log("updated browser's package.json file");
    }

    cb();
} exports.copyPackageJson = copyPackageJson;

function updateIndex(cb) {

    var template = fs.readFileSync("./templates/sample/src/index.ts", "utf8");
    for (const sample of samples) {

        let outputPath = sampleOutputFolder + sample.SampleFolderPath + "/src/index.ts";
        let oldIndexFile = fs.readFileSync(outputPath).toString();

        makeDirectoryFor(outputPath);
        let newIndexFile = Transformer.updateIndex(sample, template);
        if (newIndexFile !== oldIndexFile) {
            // log('updated: ' + outputPath);
            fs.writeFileSync(outputPath, newIndexFile);
        }
        // fs.mkdir(sampleOutputFolder + 'src', { recursive: true }, (err) => { if (err) throw err; });
        // fs.writeFileSync(outputPath, indexFile);
        // break;
    }
    cb();
} exports.updateIndex = updateIndex;

function updateSharedFiles(cb) {

    // always override these shared files
    gulp.src([
        './templates/sample/src/index.css',
        './templates/sample/sandbox.config.json',
    ])
    .pipe(flatten({ "includeParents": -1 }))
    .pipe(es.map(function(file, fileCallback) {
        let sourceContent = file.contents.toString();
        let sourcePath = Transformer.getRelative(file.dirname);
        sourcePath = sourcePath.replace('./templates/sample', '');
        sourcePath = sourcePath.replace('./templates/shared', '');

        for (const sample of samples) {
            // if (sample.isUsingFileName(file.basename)) {
                let samplePath = sampleOutputFolder + sample.SampleFolderPath;
                let targetPath = samplePath + sourcePath + '/' + file.basename;

                if (fs.existsSync(targetPath)) {
                    let targetContent = fs.readFileSync(targetPath, "utf8");
                    if (sourceContent !== targetContent) {
                        fs.writeFileSync(targetPath , sourceContent);
                        log('updated ' + targetPath);
                    }
                } else {
                    fs.writeFileSync(targetPath, sourceContent);
                    log('added ' + targetPath);
                }
        }
        fileCallback(null, file);
        // SampleFiles.push(fileDir + "/" + file.basename);
    }))

    // update these shared files if a sample is using them
    gulp.src(['./templates/shared/src/*.*'])
    .pipe(flatten({ "includeParents": -1 }))
    .pipe(es.map(function(file, fileCallback) {
        let sourceContent = file.contents.toString();
        let sourcePath = Transformer.getRelative(file.dirname);
        sourcePath = sourcePath.replace('./templates/sample', '');
        sourcePath = sourcePath.replace('./templates/shared', '');

        for (const sample of samples) {
            if (sample.isUsingFileName(file.basename)) {

                let samplePath = sampleOutputFolder + sample.SampleFolderPath;
                let targetPath = samplePath + sourcePath + '/' + file.basename;

                if (fs.existsSync(targetPath)) {
                    let targetContent = fs.readFileSync(targetPath, "utf8");
                    if (sourceContent !== targetContent) {
                        fs.writeFileSync(targetPath , sourceContent);
                        log('updated ' + targetPath);
                    }
                } else {
                    fs.writeFileSync(targetPath, sourceContent);
                    log('added ' + targetPath);
                }

                // let targetPath = sampleOutputFolder + sample.SampleFolderPath + '/src/' + file.basename;
                // let targetContent = fs.readFileSync(targetPath, "utf8");
                // if (sourceContent !== targetContent) {
                //     fs.writeFileSync(targetPath, sourceContent);
                //     // log('updated ' + file.basename + ' in ' + sample.SampleFilePath)
                //     log('updated ' + targetPath);
                // }
            }
        }
        fileCallback(null, file);
    }))
    .on("end", function() {
        cb();
    });


} exports.updateSharedFiles = updateSharedFiles;

function task1(cb) {
    log('task1  ');
    cb();
} exports.task1 = task1;

function task2(cb) {
    log('task2  ');
    cb();
} exports.task2 = task2;


// testing

function logRoutes(cb) {
    // getSamples();

    let routingGroups = Transformer.getRoutingGroups(samples);
    for (const group of routingGroups) {

        console.log('- group ' + group.Name);

        for (const component of group.Components) {

            console.log('- component ' + component.Name);
            for (const sample of component.Samples) {
                console.log('' + sample.SampleRoute + '/ **' + sample.SampleFileName + ' === ' + sample.SampleDisplayName);
            }
        }
    }

    cb();
} exports.logRoutes = logRoutes;

function logFile() {
    return es.map(function(file, cb) {
        let relative = Transformer.getRelative(file.dirname);
        log(relative + '/' + file.basename);
        // log(path.relative(path.join(file.cwd, file.base), file.path))
        cb(null, file);
    });
}

function logPublicFiles(cb) {
    gulp.src([
        './samples/**/public/*.*',
    ])
    .pipe(logFile())
    .on("end", function() { cb(); });
} exports.logPublicFiles = logPublicFiles;

function logSourceFiles(cb) {
    gulp.src([
        './samples/**/src/*.ts',
       '!./samples/**/src/index.*',

       '!./samples/**/src/AssetsUtils.ts',
       '!./samples/**/src/CategoryChartSharedData.ts',
       '!./samples/**/src/DataChartSharedData.ts',
       '!./samples/**/src/DataGridSharedData.ts',
       '!./samples/**/src/DockManagerSharedData.ts',
       '!./samples/**/src/EsriUtility.ts',
       '!./samples/**/src/ExcelUtility.ts',
       '!./samples/**/src/ExcelSharedData.ts',
       '!./samples/**/src/FinancialData.ts',
       '!./samples/**/src/heatworker.worker.ts',
       '!./samples/**/src/LiveFinancialData.ts',
       '!./samples/**/src/MapShapeStyleUtility.ts',
       '!./samples/**/src/MapUtils.ts',
       '!./samples/**/src/odatajs-4.0.0.js',
       '!./samples/**/src/Products.ts',
       '!./samples/**/src/PeriodicElements.ts',
       '!./samples/**/src/SampleCategoryData.ts',
       '!./samples/**/src/SampleDensityData.ts',
       '!./samples/**/src/SampleFinancialData.ts',
       '!./samples/**/src/SamplePolarData.ts',
       '!./samples/**/src/SampleRadialData.ts',
       '!./samples/**/src/SampleRangeData.ts',
       '!./samples/**/src/SampleScatterData.ts',
       '!./samples/**/src/SampleScatterStats.ts',
       '!./samples/**/src/SampleShapeData.ts',
       '!./samples/**/src/SampleSparklineData.ts',
       '!./samples/**/src/SampleTreeData.ts',
       '!./samples/**/src/SparklineSharedData.ts',
       '!./samples/**/src/StocksHistory.ts',
       '!./samples/**/src/StocksUtility.ts',
       '!./samples/**/src/StringUtils.ts',
       '!./samples/**/src/TaskUtils.ts',
       '!./samples/**/src/WorldCities.ts',
       '!./samples/**/src/WorldConnections.ts',
       '!./samples/**/src/WorldLocations.ts',
       '!./samples/**/src/WorldUtils.ts',
    ])
    .pipe(logFile())
    .on("end", function() { cb(); });
} exports.logSourceFiles = logSourceFiles;

function logRootFiles(cb) {
    gulp.src([
        './samples/**/*.*',
       '!./samples/**/src/*.*',
       '!./samples/**/*.ts',
       '!./samples/**/*.ts',
       '!./samples/**/*.css',
       '!./samples/**/index.*',
       '!./samples/**/manifest.json',
       '!./samples/**/package.json',
       '!./samples/**/tsconfig.json',
    ])
    .pipe(es.map(function(file, cbFile) {
        let relative = Transformer.getRelative(file.dirname);
        log(file.basename + ' ' + relative + '/' + file.basename);
        cbFile(null, file);
    }))
    .on("end", function() { cb(); });
} exports.logRootFiles = logRootFiles;

function logUniqueFiles(cb) {

    let fileNames = [];
    gulp.src([
        './samples/**/src/*.ts',
       '!./samples/**/src/index.*',
    ])
    .pipe(es.map(function(file, cbFile) {
        if (fileNames.indexOf(file.basename) === -1) {
            fileNames.push(file.basename);
        }
        cbFile(null, file);
    }))
    .on("end", function() {
        fileNames.sort();
        for (const name of fileNames) {
            log(name);
        }
        cb();
    });

} exports.logUniqueFiles = logUniqueFiles;







