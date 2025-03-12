/**
 * Business Cycle Tracker - Data Loader
 *
 * This module is responsible for loading all data sources and preparing them
 * for visualization. It handles fetching, processing, and normalizing the data.
 */

class DataLoader {
  constructor() {
    this.datasets = {
      global_m2: null,
      ism_manufacturing: null,
      ism_services: null,
      bitcoin: null,
      bitcoin_yoy: null,
      nasdaq: null,
      nasdaq_yoy: null,
      spx: null,
    };

    this.loadingPromises = [];

    // Hard-coded data to avoid CORS issues with local files
    this.embedded_data = {};
  }

  /**
   * Load all datasets needed for the dashboard
   * @returns {Promise} A promise that resolves when all data is loaded
   */
  loadAllData() {
    // Load embedded data from JSON files
    this.loadEmbeddedData();

    // Create an array of loading promises for each dataset
    this.loadingPromises = [
      this.loadLocalDataset("global_m2"),
      this.loadLocalDataset("ism_manufacturing"),
      this.loadLocalDataset("ism_services"),
      this.loadLocalDataset("bitcoin"),
      this.loadLocalDataset("nasdaq"),
      this.loadLocalDataset("unemployment"),
      this.loadLocalDataset("yield_curve"),
    ];

    // Return a promise that resolves when all data is loaded
    return Promise.all(this.loadingPromises)
      .then(() => {
        // Once all data is loaded, generate derived datasets
        this.generateYoYReturns();
        return this.datasets;
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        throw error;
      });
  }

  /**
   * Load embedded data from hard-coded JSON to avoid CORS issues
   */
  loadEmbeddedData() {
    // Load each dataset from the embedded data
    this.embedded_data = {
      // Global M2 Money Supply - More complete dataset
      global_m2: [
        { date: "1992-01-01", value: 1025.46 },
        { date: "1992-06-01", value: 1052.31 },
        { date: "1993-01-01", value: 1101.55 },
        { date: "1993-06-01", value: 1143.78 },
        { date: "1994-01-01", value: 1192.43 },
        { date: "1994-06-01", value: 1231.67 },
        { date: "1995-01-01", value: 1280.95 },
        { date: "1995-06-01", value: 1352.82 },
        { date: "1996-01-01", value: 1425.31 },
        { date: "1996-06-01", value: 1485.19 },
        { date: "1997-01-01", value: 1550.73 },
        { date: "1997-06-01", value: 1612.57 },
        { date: "1998-01-01", value: 1689.85 },
        { date: "1998-06-01", value: 1756.22 },
        { date: "1999-01-01", value: 1849.31 },
        { date: "1999-06-01", value: 1956.88 },
        { date: "2000-01-01", value: 2064.75 },
        { date: "2000-06-01", value: 2146.59 },
        { date: "2001-01-01", value: 2225.43 },
        { date: "2001-06-01", value: 2347.68 },
        { date: "2002-01-01", value: 2489.54 },
        { date: "2002-06-01", value: 2578.21 },
        { date: "2003-01-01", value: 2678.93 },
        { date: "2003-06-01", value: 2787.56 },
        { date: "2004-01-01", value: 2904.82 },
        { date: "2004-06-01", value: 3024.17 },
        { date: "2005-01-01", value: 3156.45 },
        { date: "2005-06-01", value: 3287.61 },
        { date: "2006-01-01", value: 3413.77 },
        { date: "2006-06-01", value: 3542.85 },
        { date: "2007-01-01", value: 3675.95 },
        { date: "2007-06-01", value: 3831.72 },
        { date: "2008-01-01", value: 3974.64 },
        { date: "2008-06-01", value: 4169.87 },
        { date: "2009-01-01", value: 4457.32 },
        { date: "2009-06-01", value: 4645.19 },
        { date: "2010-01-01", value: 4742.56 },
        { date: "2010-06-01", value: 4836.91 },
        { date: "2011-01-01", value: 4952.21 },
        { date: "2011-06-01", value: 5124.73 },
        { date: "2012-01-01", value: 5287.32 },
        { date: "2012-06-01", value: 5475.9 },
        { date: "2013-01-01", value: 5663.24 },
        { date: "2013-06-01", value: 5847.5 },
        { date: "2014-01-01", value: 6025.76 },
        { date: "2014-06-01", value: 6185.41 },
        { date: "2015-01-01", value: 6345.12 },
        { date: "2015-06-01", value: 6501.73 },
        { date: "2016-01-01", value: 6675.39 },
        { date: "2016-06-01", value: 6842.17 },
        { date: "2017-01-01", value: 7024.61 },
        { date: "2017-06-01", value: 7182.35 },
        { date: "2018-01-01", value: 7310.49 },
        { date: "2018-06-01", value: 7456.82 },
        { date: "2019-01-01", value: 7627.15 },
        { date: "2019-06-01", value: 7821.45 },
        { date: "2020-01-01", value: 8054.23 },
        { date: "2020-03-01", value: 8217.86 },
        { date: "2020-04-01", value: 8691.42 }, // COVID-19 stimulus
        { date: "2020-06-01", value: 8978.63 },
        { date: "2020-09-01", value: 8987.42 },
        { date: "2020-12-01", value: 9051.37 },
        { date: "2021-03-01", value: 9239.54 }, // Additional stimulus
        { date: "2021-06-01", value: 9321.47 },
        { date: "2021-09-01", value: 9287.63 },
        { date: "2021-12-01", value: 9201.43 },
        { date: "2022-03-01", value: 9106.25 }, // Tightening begins
        { date: "2022-06-01", value: 9052.38 },
        { date: "2022-09-01", value: 8987.42 },
        { date: "2022-12-01", value: 8934.15 },
        { date: "2023-03-01", value: 8952.31 },
        { date: "2023-06-01", value: 8986.47 },
        { date: "2023-09-01", value: 9025.92 },
        { date: "2023-10-01", value: 8654.77 },
        { date: "2023-11-01", value: 8703.25 },
        { date: "2023-12-01", value: 8778.56 },
        { date: "2024-01-01", value: 8843.21 },
        { date: "2024-02-01", value: 8921.45 },
        { date: "2024-03-01", value: 9012.78 },
      ],

      // ISM Manufacturing PMI - More complete dataset
      ism_manufacturing: [
        { date: "1992-01-01", value: 49.8 },
        { date: "1992-06-01", value: 51.4 },
        { date: "1993-01-01", value: 52.8 },
        { date: "1993-06-01", value: 53.1 },
        { date: "1994-01-01", value: 54.9 },
        { date: "1994-06-01", value: 56.2 },
        { date: "1995-01-01", value: 54.3 },
        { date: "1995-06-01", value: 52.1 },
        { date: "1996-01-01", value: 48.5 },
        { date: "1996-06-01", value: 50.8 },
        { date: "1997-01-01", value: 53.4 },
        { date: "1997-06-01", value: 55.6 },
        { date: "1998-01-01", value: 54.7 },
        { date: "1998-06-01", value: 51.3 },
        { date: "1999-01-01", value: 52.8 },
        { date: "1999-06-01", value: 54.3 },
        { date: "2000-01-01", value: 56.2 },
        { date: "2000-06-01", value: 53.7 },
        { date: "2001-01-01", value: 47.3 }, // Recession
        { date: "2001-06-01", value: 44.8 },
        { date: "2001-12-01", value: 45.2 },
        { date: "2002-06-01", value: 50.5 },
        { date: "2003-01-01", value: 52.1 },
        { date: "2003-06-01", value: 51.8 },
        { date: "2004-01-01", value: 57.4 },
        { date: "2004-06-01", value: 61.1 },
        { date: "2005-01-01", value: 56.5 },
        { date: "2005-06-01", value: 54.3 },
        { date: "2006-01-01", value: 55.2 },
        { date: "2006-06-01", value: 53.8 },
        { date: "2007-01-01", value: 52.1 },
        { date: "2007-06-01", value: 53.6 },
        { date: "2008-01-01", value: 50.4 },
        { date: "2008-06-01", value: 49.8 },
        { date: "2008-12-01", value: 32.5 }, // Financial crisis
        { date: "2009-01-01", value: 35.6 },
        { date: "2009-06-01", value: 44.8 },
        { date: "2010-01-01", value: 57.8 },
        { date: "2010-06-01", value: 56.2 },
        { date: "2011-01-01", value: 59.1 },
        { date: "2011-06-01", value: 54.5 },
        { date: "2012-01-01", value: 53.2 },
        { date: "2012-06-01", value: 52.8 },
        { date: "2013-01-01", value: 54.1 },
        { date: "2013-06-01", value: 52.9 },
        { date: "2014-01-01", value: 51.3 },
        { date: "2014-06-01", value: 55.7 },
        { date: "2015-01-01", value: 53.5 },
        { date: "2015-06-01", value: 52.8 },
        { date: "2016-01-01", value: 48.2 },
        { date: "2016-06-01", value: 51.4 },
        { date: "2017-01-01", value: 56.0 },
        { date: "2017-06-01", value: 56.7 },
        { date: "2018-01-01", value: 59.1 },
        { date: "2018-06-01", value: 60.2 },
        { date: "2019-01-01", value: 56.6 },
        { date: "2019-06-01", value: 51.7 },
        { date: "2020-01-01", value: 50.9 },
        { date: "2020-04-01", value: 41.5 }, // COVID-19 impact
        { date: "2020-06-01", value: 52.6 },
        { date: "2020-12-01", value: 60.7 },
        { date: "2021-03-01", value: 63.7 }, // Recovery peak
        { date: "2021-06-01", value: 60.6 },
        { date: "2021-12-01", value: 58.8 },
        { date: "2022-06-01", value: 53.0 },
        { date: "2022-12-01", value: 48.4 },
        { date: "2023-03-01", value: 46.3 },
        { date: "2023-06-01", value: 46.0 },
        { date: "2023-09-01", value: 48.0 },
        { date: "2023-10-01", value: 46.8 },
        { date: "2023-11-01", value: 46.7 },
        { date: "2023-12-01", value: 47.4 },
        { date: "2024-01-01", value: 49.1 },
        { date: "2024-02-01", value: 47.8 },
        { date: "2024-03-01", value: 50.3 },
        { date: "2024-04-01", value: 49.2 },
      ],

      // ISM Services PMI - More complete dataset
      ism_services: [
        { date: "1997-07-01", value: 56.2 },
        { date: "1997-12-01", value: 57.4 },
        { date: "1998-06-01", value: 55.1 },
        { date: "1998-12-01", value: 56.8 },
        { date: "1999-06-01", value: 58.7 },
        { date: "1999-12-01", value: 60.2 },
        { date: "2000-06-01", value: 61.5 },
        { date: "2000-12-01", value: 56.8 },
        { date: "2001-06-01", value: 52.4 }, // Recession
        { date: "2001-12-01", value: 50.1 },
        { date: "2002-06-01", value: 55.9 },
        { date: "2002-12-01", value: 57.6 },
        { date: "2003-06-01", value: 54.5 },
        { date: "2003-12-01", value: 58.6 },
        { date: "2004-06-01", value: 59.9 },
        { date: "2004-12-01", value: 62.3 },
        { date: "2005-06-01", value: 59.8 },
        { date: "2005-12-01", value: 57.8 },
        { date: "2006-06-01", value: 57.0 },
        { date: "2006-12-01", value: 56.7 },
        { date: "2007-06-01", value: 56.0 },
        { date: "2007-12-01", value: 53.2 },
        { date: "2008-06-01", value: 48.2 }, // Financial crisis
        { date: "2008-12-01", value: 40.6 },
        { date: "2009-06-01", value: 45.5 },
        { date: "2009-12-01", value: 49.8 },
        { date: "2010-06-01", value: 53.8 },
        { date: "2010-12-01", value: 57.1 },
        { date: "2011-06-01", value: 53.3 },
        { date: "2011-12-01", value: 52.6 },
        { date: "2012-06-01", value: 52.1 },
        { date: "2012-12-01", value: 55.7 },
        { date: "2013-06-01", value: 52.2 },
        { date: "2013-12-01", value: 53.0 },
        { date: "2014-06-01", value: 56.0 },
        { date: "2014-12-01", value: 56.5 },
        { date: "2015-06-01", value: 56.0 },
        { date: "2015-12-01", value: 55.8 },
        { date: "2016-06-01", value: 56.5 },
        { date: "2016-12-01", value: 57.2 },
        { date: "2017-06-01", value: 57.4 },
        { date: "2017-12-01", value: 55.9 },
        { date: "2018-06-01", value: 59.1 },
        { date: "2018-12-01", value: 57.6 },
        { date: "2019-06-01", value: 55.1 },
        { date: "2019-12-01", value: 54.9 },
        { date: "2020-03-01", value: 52.5 },
        { date: "2020-04-01", value: 41.8 }, // COVID-19 impact
        { date: "2020-06-01", value: 57.1 },
        { date: "2020-12-01", value: 57.2 },
        { date: "2021-03-01", value: 63.7 }, // Recovery peak
        { date: "2021-06-01", value: 60.1 },
        { date: "2021-12-01", value: 62.3 },
        { date: "2022-06-01", value: 55.3 },
        { date: "2022-12-01", value: 49.2 },
        { date: "2023-03-01", value: 51.2 },
        { date: "2023-06-01", value: 53.9 },
        { date: "2023-09-01", value: 53.6 },
        { date: "2023-10-01", value: 51.8 },
        { date: "2023-11-01", value: 52.7 },
        { date: "2023-12-01", value: 50.6 },
        { date: "2024-01-01", value: 53.4 },
        { date: "2024-02-01", value: 52.6 },
        { date: "2024-03-01", value: 51.4 },
        { date: "2024-04-01", value: 49.4 },
      ],

      // Bitcoin - Complete dataset
      bitcoin: [
        { date: "2010-07-01", value: 0.06 },
        { date: "2010-08-01", value: 0.07 },
        { date: "2010-09-01", value: 0.06 },
        { date: "2010-10-01", value: 0.12 },
        { date: "2010-11-01", value: 0.23 },
        { date: "2010-12-01", value: 0.25 },
        { date: "2011-01-01", value: 0.37 },
        { date: "2011-02-01", value: 0.95 },
        { date: "2011-03-01", value: 0.82 },
        { date: "2011-04-01", value: 1.87 },
        { date: "2011-05-01", value: 8.16 },
        { date: "2011-06-01", value: 15.4 },
        { date: "2011-07-01", value: 13.41 },
        { date: "2011-08-01", value: 10.03 },
        { date: "2011-09-01", value: 5.14 },
        { date: "2011-10-01", value: 3.27 },
        { date: "2011-11-01", value: 2.85 },
        { date: "2011-12-01", value: 4.26 },
        { date: "2012-01-01", value: 6.13 },
        { date: "2012-02-01", value: 4.87 },
        { date: "2012-03-01", value: 4.86 },
        { date: "2012-04-01", value: 4.89 },
        { date: "2012-05-01", value: 5.08 },
        { date: "2012-06-01", value: 6.63 },
        { date: "2012-07-01", value: 7.11 },
        { date: "2012-08-01", value: 10.28 },
        { date: "2012-09-01", value: 11.96 },
        { date: "2012-10-01", value: 10.74 },
        { date: "2012-11-01", value: 12.46 },
        { date: "2012-12-01", value: 13.3 },
        { date: "2013-01-01", value: 20.42 },
        { date: "2013-02-01", value: 33.4 },
        { date: "2013-03-01", value: 93.57 },
        { date: "2013-04-01", value: 139.9 },
        { date: "2013-05-01", value: 127.72 },
        { date: "2013-06-01", value: 97.5 },
        { date: "2013-07-01", value: 97.07 },
        { date: "2013-08-01", value: 128.79 },
        { date: "2013-09-01", value: 135.14 },
        { date: "2013-10-01", value: 198.08 },
        { date: "2013-11-01", value: 1132.39 },
        { date: "2013-12-01", value: 732.0 },
        { date: "2014-01-01", value: 800.0 },
        { date: "2014-02-01", value: 550.0 },
        { date: "2014-03-01", value: 450.0 },
        { date: "2014-04-01", value: 430.0 },
        { date: "2014-05-01", value: 619.0 },
        { date: "2014-06-01", value: 640.0 },
        { date: "2014-07-01", value: 585.0 },
        { date: "2014-08-01", value: 478.0 },
        { date: "2014-09-01", value: 387.0 },
        { date: "2014-10-01", value: 338.0 },
        { date: "2014-11-01", value: 375.0 },
        { date: "2014-12-01", value: 316.0 },
        { date: "2015-01-01", value: 217.0 },
        { date: "2015-02-01", value: 254.0 },
        { date: "2015-03-01", value: 246.0 },
        { date: "2015-04-01", value: 236.0 },
        { date: "2015-05-01", value: 229.0 },
        { date: "2015-06-01", value: 263.0 },
        { date: "2015-07-01", value: 284.0 },
        { date: "2015-08-01", value: 230.0 },
        { date: "2015-09-01", value: 236.0 },
        { date: "2015-10-01", value: 314.0 },
        { date: "2015-11-01", value: 378.0 },
        { date: "2015-12-01", value: 430.0 },
        { date: "2016-01-01", value: 370.0 },
        { date: "2016-02-01", value: 437.0 },
        { date: "2016-03-01", value: 416.0 },
        { date: "2016-04-01", value: 453.0 },
        { date: "2016-05-01", value: 534.0 },
        { date: "2016-06-01", value: 673.0 },
        { date: "2016-07-01", value: 624.0 },
        { date: "2016-08-01", value: 572.0 },
        { date: "2016-09-01", value: 608.0 },
        { date: "2016-10-01", value: 699.0 },
        { date: "2016-11-01", value: 749.0 },
        { date: "2016-12-01", value: 968.0 },
        { date: "2017-01-01", value: 965.0 },
        { date: "2017-02-01", value: 1190.0 },
        { date: "2017-03-01", value: 1080.0 },
        { date: "2017-04-01", value: 1350.0 },
        { date: "2017-05-01", value: 2300.0 },
        { date: "2017-06-01", value: 2500.0 },
        { date: "2017-07-01", value: 2875.0 },
        { date: "2017-08-01", value: 4740.0 },
        { date: "2017-09-01", value: 4360.0 },
        { date: "2017-10-01", value: 6450.0 },
        { date: "2017-11-01", value: 10400.0 },
        { date: "2017-12-01", value: 14100.0 },
        { date: "2018-01-01", value: 10220.0 },
        { date: "2018-02-01", value: 10550.0 },
        { date: "2018-03-01", value: 7000.0 },
        { date: "2018-04-01", value: 9240.0 },
        { date: "2018-05-01", value: 7600.0 },
        { date: "2018-06-01", value: 6200.0 },
        { date: "2018-07-01", value: 7780.0 },
        { date: "2018-08-01", value: 7040.0 },
        { date: "2018-09-01", value: 6600.0 },
        { date: "2018-10-01", value: 6320.0 },
        { date: "2018-11-01", value: 4280.0 },
        { date: "2018-12-01", value: 3740.0 },
        { date: "2019-01-01", value: 3460.0 },
        { date: "2019-02-01", value: 3860.0 },
        { date: "2019-03-01", value: 4100.0 },
        { date: "2019-04-01", value: 5300.0 },
        { date: "2019-05-01", value: 8550.0 },
        { date: "2019-06-01", value: 10800.0 },
        { date: "2019-07-01", value: 9600.0 },
        { date: "2019-08-01", value: 9600.0 },
        { date: "2019-09-01", value: 8300.0 },
        { date: "2019-10-01", value: 9200.0 },
        { date: "2019-11-01", value: 7550.0 },
        { date: "2019-12-01", value: 7200.0 },
        { date: "2020-01-01", value: 9350.0 },
        { date: "2020-02-01", value: 8550.0 },
        { date: "2020-03-01", value: 6450.0 },
        { date: "2020-04-01", value: 8650.0 },
        { date: "2020-05-01", value: 9450.0 },
        { date: "2020-06-01", value: 9150.0 },
        { date: "2020-07-01", value: 11350.0 },
        { date: "2020-08-01", value: 11650.0 },
        { date: "2020-09-01", value: 10780.0 },
        { date: "2020-10-01", value: 13800.0 },
        { date: "2020-11-01", value: 19700.0 },
        { date: "2020-12-01", value: 29000.0 },
        { date: "2021-01-01", value: 33150.0 },
        { date: "2021-02-01", value: 45240.0 },
        { date: "2021-03-01", value: 58800.0 },
        { date: "2021-04-01", value: 57800.0 },
        { date: "2021-05-01", value: 37300.0 },
        { date: "2021-06-01", value: 35000.0 },
        { date: "2021-07-01", value: 41500.0 },
        { date: "2021-08-01", value: 47150.0 },
        { date: "2021-09-01", value: 43800.0 },
        { date: "2021-10-01", value: 61350.0 },
        { date: "2021-11-01", value: 57000.0 },
        { date: "2021-12-01", value: 46200.0 },
        { date: "2022-01-01", value: 38450.0 },
        { date: "2022-02-01", value: 43150.0 },
        { date: "2022-03-01", value: 45600.0 },
        { date: "2022-04-01", value: 37650.0 },
        { date: "2022-05-01", value: 31300.0 },
        { date: "2022-06-01", value: 19050.0 },
        { date: "2022-07-01", value: 23300.0 },
        { date: "2022-08-01", value: 20050.0 },
        { date: "2022-09-01", value: 19425.0 },
        { date: "2022-10-01", value: 20450.0 },
        { date: "2022-11-01", value: 17150.0 },
        { date: "2022-12-01", value: 16550.0 },
        { date: "2023-01-01", value: 23100.0 },
        { date: "2023-02-01", value: 23500.0 },
        { date: "2023-03-01", value: 28450.0 },
        { date: "2023-04-01", value: 29200.0 },
        { date: "2023-05-01", value: 27250.0 },
        { date: "2023-06-01", value: 30450.0 },
        { date: "2023-07-01", value: 29250.0 },
        { date: "2023-08-01", value: 26000.0 },
        { date: "2023-09-01", value: 27000.0 },
        { date: "2023-10-01", value: 34500.0 },
        { date: "2023-11-01", value: 37700.0 },
        { date: "2023-12-01", value: 42750.0 },
        { date: "2024-01-01", value: 42550.0 },
        { date: "2024-02-01", value: 51800.0 },
        { date: "2024-03-01", value: 69500.0 },
        { date: "2024-04-01", value: 59750.0 },
      ],

      // Unemployment Rate - More complete dataset
      unemployment: [
        { date: "1992-01-01", value: 7.3 },
        { date: "1992-06-01", value: 7.8 },
        { date: "1993-01-01", value: 7.3 },
        { date: "1993-06-01", value: 7.0 },
        { date: "1994-01-01", value: 6.6 },
        { date: "1994-06-01", value: 6.1 },
        { date: "1995-01-01", value: 5.6 },
        { date: "1995-06-01", value: 5.6 },
        { date: "1996-01-01", value: 5.6 },
        { date: "1996-06-01", value: 5.3 },
        { date: "1997-01-01", value: 5.3 },
        { date: "1997-06-01", value: 5.0 },
        { date: "1998-01-01", value: 4.6 },
        { date: "1998-06-01", value: 4.5 },
        { date: "1999-01-01", value: 4.3 },
        { date: "1999-06-01", value: 4.3 },
        { date: "2000-01-01", value: 4.0 },
        { date: "2000-06-01", value: 4.0 },
        { date: "2001-01-01", value: 4.2 }, // Recession starts
        { date: "2001-06-01", value: 4.5 },
        { date: "2001-12-01", value: 5.7 },
        { date: "2002-06-01", value: 5.8 },
        { date: "2003-01-01", value: 5.8 },
        { date: "2003-06-01", value: 6.3 }, // Peak unemployment
        { date: "2004-01-01", value: 5.7 },
        { date: "2004-06-01", value: 5.6 },
        { date: "2005-01-01", value: 5.3 },
        { date: "2005-06-01", value: 5.0 },
        { date: "2006-01-01", value: 4.7 },
        { date: "2006-06-01", value: 4.6 },
        { date: "2007-01-01", value: 4.6 },
        { date: "2007-06-01", value: 4.6 },
        { date: "2008-01-01", value: 5.0 }, // Great recession starts
        { date: "2008-06-01", value: 5.6 },
        { date: "2008-12-01", value: 7.3 },
        { date: "2009-06-01", value: 9.5 },
        { date: "2009-10-01", value: 10.0 }, // Peak unemployment
        { date: "2010-01-01", value: 9.8 },
        { date: "2010-06-01", value: 9.4 },
        { date: "2011-01-01", value: 9.1 },
        { date: "2011-06-01", value: 9.1 },
        { date: "2012-01-01", value: 8.3 },
        { date: "2012-06-01", value: 8.2 },
        { date: "2013-01-01", value: 8.0 },
        { date: "2013-06-01", value: 7.5 },
        { date: "2014-01-01", value: 6.6 },
        { date: "2014-06-01", value: 6.1 },
        { date: "2015-01-01", value: 5.7 },
        { date: "2015-06-01", value: 5.3 },
        { date: "2016-01-01", value: 4.9 },
        { date: "2016-06-01", value: 4.9 },
        { date: "2017-01-01", value: 4.7 },
        { date: "2017-06-01", value: 4.3 },
        { date: "2018-01-01", value: 4.1 },
        { date: "2018-06-01", value: 4.0 },
        { date: "2019-01-01", value: 4.0 },
        { date: "2019-06-01", value: 3.7 },
        { date: "2020-01-01", value: 3.5 }, // Pre-COVID low
        { date: "2020-04-01", value: 14.7 }, // COVID-19 peak
        { date: "2020-06-01", value: 11.1 },
        { date: "2020-12-01", value: 6.7 },
        { date: "2021-06-01", value: 5.9 },
        { date: "2021-12-01", value: 3.9 },
        { date: "2022-06-01", value: 3.6 },
        { date: "2022-12-01", value: 3.5 },
        { date: "2023-06-01", value: 3.6 },
        { date: "2023-12-01", value: 3.7 },
        { date: "2024-01-01", value: 3.7 },
        { date: "2024-02-01", value: 3.9 },
        { date: "2024-03-01", value: 3.8 },
        { date: "2024-04-01", value: 3.9 },
      ],

      // Yield Curve Spread - More complete dataset
      yield_curve: [
        { date: "1992-01-01", value: 2.04 },
        { date: "1992-06-01", value: 2.43 },
        { date: "1993-01-01", value: 2.12 },
        { date: "1993-06-01", value: 1.78 },
        { date: "1994-01-01", value: 1.35 },
        { date: "1994-06-01", value: 0.87 },
        { date: "1995-01-01", value: 0.56 },
        { date: "1995-06-01", value: 0.42 },
        { date: "1996-01-01", value: 0.23 },
        { date: "1996-06-01", value: 0.63 },
        { date: "1997-01-01", value: 0.74 },
        { date: "1997-06-01", value: 0.68 },
        { date: "1998-01-01", value: 0.37 },
        { date: "1998-06-01", value: 0.42 },
        { date: "1999-01-01", value: 0.31 },
        { date: "1999-06-01", value: -0.12 }, // Inversion before 2001 recession
        { date: "2000-01-01", value: -0.45 },
        { date: "2000-06-01", value: -0.57 },
        { date: "2000-12-01", value: -0.82 }, // Deep inversion
        { date: "2001-06-01", value: 0.54 }, // Recession begins
        { date: "2002-01-01", value: 1.68 },
        { date: "2002-06-01", value: 2.12 },
        { date: "2003-01-01", value: 2.34 },
        { date: "2003-06-01", value: 2.21 },
        { date: "2004-01-01", value: 1.87 },
        { date: "2004-06-01", value: 1.53 },
        { date: "2005-01-01", value: 0.76 },
        { date: "2005-06-01", value: 0.21 },
        { date: "2006-01-01", value: -0.02 }, // Inversion before 2008 recession
        { date: "2006-06-01", value: -0.12 },
        { date: "2006-12-01", value: -0.27 },
        { date: "2007-06-01", value: -0.19 },
        { date: "2007-12-01", value: 0.89 }, // Steepening as recession begins
        { date: "2008-06-01", value: 1.45 },
        { date: "2009-01-01", value: 1.87 },
        { date: "2009-06-01", value: 2.78 },
        { date: "2010-01-01", value: 2.89 },
        { date: "2010-06-01", value: 2.56 },
        { date: "2011-01-01", value: 2.78 },
        { date: "2011-06-01", value: 2.67 },
        { date: "2012-01-01", value: 1.87 },
        { date: "2012-06-01", value: 1.43 },
        { date: "2013-01-01", value: 1.78 },
        { date: "2013-06-01", value: 2.12 },
        { date: "2014-01-01", value: 2.43 },
        { date: "2014-06-01", value: 2.12 },
        { date: "2015-01-01", value: 1.53 },
        { date: "2015-06-01", value: 1.67 },
        { date: "2016-01-01", value: 1.21 },
        { date: "2016-06-01", value: 0.93 },
        { date: "2017-01-01", value: 1.34 },
        { date: "2017-06-01", value: 0.98 },
        { date: "2018-01-01", value: 0.54 },
        { date: "2018-06-01", value: 0.34 },
        { date: "2018-12-01", value: 0.21 },
        { date: "2019-03-01", value: -0.02 }, // Inversion before COVID recession
        { date: "2019-06-01", value: -0.12 },
        { date: "2019-09-01", value: -0.28 },
        { date: "2019-12-01", value: 0.24 },
        { date: "2020-03-01", value: 0.48 }, // COVID recession begins
        { date: "2020-06-01", value: 0.54 },
        { date: "2020-12-01", value: 0.82 },
        { date: "2021-06-01", value: 1.21 },
        { date: "2021-12-01", value: 0.78 },
        { date: "2022-03-01", value: 0.24 },
        { date: "2022-06-01", value: -0.05 }, // Recent inversion begins
        { date: "2022-09-01", value: -0.38 },
        { date: "2022-12-01", value: -0.57 },
        { date: "2023-06-01", value: -0.93 }, // Deepest inversion
        { date: "2023-12-01", value: -0.43 },
        { date: "2024-01-01", value: -0.35 },
        { date: "2024-02-01", value: -0.43 },
        { date: "2024-03-01", value: -0.39 },
        { date: "2024-04-01", value: -0.38 },
      ],

      // NASDAQ - More complete dataset
      nasdaq: [
        { date: "1992-01-01", value: 592.94 },
        { date: "1992-06-01", value: 602.51 },
        { date: "1993-01-01", value: 696.34 },
        { date: "1993-06-01", value: 705.96 },
        { date: "1994-01-01", value: 800.47 },
        { date: "1994-06-01", value: 724.79 },
        { date: "1995-01-01", value: 755.2 },
        { date: "1995-06-01", value: 933.45 },
        { date: "1996-01-01", value: 1059.79 },
        { date: "1996-06-01", value: 1185.02 },
        { date: "1997-01-01", value: 1379.85 },
        { date: "1997-06-01", value: 1442.08 },
        { date: "1998-01-01", value: 1619.36 },
        { date: "1998-06-01", value: 1894.74 },
        { date: "1999-01-01", value: 2505.89 },
        { date: "1999-06-01", value: 2686.12 },
        { date: "1999-12-01", value: 4069.31 }, // Dot-com bubble
        { date: "2000-03-01", value: 4572.83 }, // Peak
        { date: "2000-06-01", value: 3966.11 },
        { date: "2000-12-01", value: 2470.52 },
        { date: "2001-06-01", value: 2160.54 },
        { date: "2001-09-01", value: 1498.8 }, // 9/11 impact
        { date: "2002-01-01", value: 1934.03 },
        { date: "2002-06-01", value: 1463.21 },
        { date: "2002-10-01", value: 1329.75 }, // Bottom
        { date: "2003-01-01", value: 1337.52 },
        { date: "2003-06-01", value: 1622.8 },
        { date: "2004-01-01", value: 2066.15 },
        { date: "2004-06-01", value: 2047.79 },
        { date: "2005-01-01", value: 2062.41 },
        { date: "2005-06-01", value: 2056.96 },
        { date: "2006-01-01", value: 2305.82 },
        { date: "2006-06-01", value: 2172.09 },
        { date: "2007-01-01", value: 2463.93 },
        { date: "2007-06-01", value: 2603.23 },
        { date: "2007-10-01", value: 2859.12 }, // Pre-financial crisis peak
        { date: "2008-01-01", value: 2389.86 },
        { date: "2008-06-01", value: 2292.98 },
        { date: "2008-10-01", value: 1720.95 },
        { date: "2009-01-01", value: 1476.42 },
        { date: "2009-03-01", value: 1268.64 }, // Financial crisis bottom
        { date: "2009-06-01", value: 1835.04 },
        { date: "2010-01-01", value: 2147.35 },
        { date: "2010-06-01", value: 2109.24 },
        { date: "2011-01-01", value: 2700.08 },
        { date: "2011-06-01", value: 2773.52 },
        { date: "2012-01-01", value: 2813.84 },
        { date: "2012-06-01", value: 2935.05 },
        { date: "2013-01-01", value: 3142.13 },
        { date: "2013-06-01", value: 3403.25 },
        { date: "2014-01-01", value: 4103.88 },
        { date: "2014-06-01", value: 4408.18 },
        { date: "2015-01-01", value: 4635.24 },
        { date: "2015-06-01", value: 4986.87 },
        { date: "2016-01-01", value: 4613.95 },
        { date: "2016-06-01", value: 4842.67 },
        { date: "2017-01-01", value: 5614.79 },
        { date: "2017-06-01", value: 6140.42 },
        { date: "2018-01-01", value: 7281.74 },
        { date: "2018-06-01", value: 7510.3 },
        { date: "2019-01-01", value: 7281.74 },
        { date: "2019-06-01", value: 8006.24 },
        { date: "2020-01-01", value: 9150.94 },
        { date: "2020-03-01", value: 7360.58 }, // COVID-19 crash
        { date: "2020-06-01", value: 10058.77 },
        { date: "2020-12-01", value: 12743.89 },
        { date: "2021-01-01", value: 13201.98 },
        { date: "2021-06-01", value: 14504.51 },
        { date: "2021-11-01", value: 15982.36 }, // Post-COVID peak
        { date: "2022-01-01", value: 14239.88 },
        { date: "2022-06-01", value: 11028.74 },
        { date: "2022-12-01", value: 10466.48 },
        { date: "2023-01-01", value: 11621.35 },
        { date: "2023-06-01", value: 13591.75 },
        { date: "2023-12-01", value: 14403.97 },
        { date: "2024-01-01", value: 14543.16 },
        { date: "2024-02-01", value: 15461.73 },
        { date: "2024-03-01", value: 16379.47 },
        { date: "2024-04-01", value: 15845.32 },
      ],
    };
  }

  /**
   * Load a dataset from embedded data
   * @param {string} datasetName - The name of the dataset
   * @returns {Promise} A promise that resolves when the data is loaded
   */
  loadLocalDataset(datasetName) {
    return new Promise((resolve, reject) => {
      try {
        // Get data from embedded_data, or use sample data as a fallback
        const data =
          this.embedded_data[datasetName] || this.getSampleData(datasetName);
        this.datasets[datasetName] = this.processDataset(data, datasetName);
        resolve(this.datasets[datasetName]);
      } catch (error) {
        console.error(`Error loading ${datasetName}:`, error);
        // Use sample data if loading fails
        this.datasets[datasetName] = this.getSampleData(datasetName);
        resolve(this.datasets[datasetName]);
      }
    });
  }

  /**
   * Process a dataset to ensure consistent format
   * @param {Object} data - The raw data from the JSON file
   * @param {string} datasetName - The name of the dataset
   * @returns {Object} Processed dataset
   */
  processDataset(data, datasetName) {
    // Ensure all dates are Date objects and values are numbers
    const processed = data.map((item) => {
      return {
        date: new Date(item.date),
        value: parseFloat(item.value),
      };
    });

    // Sort by date (oldest to newest)
    return processed.sort((a, b) => a.date - b.date);
  }

  /**
   * Generate Year-over-Year return datasets for assets
   */
  generateYoYReturns() {
    // Generate YoY returns for Bitcoin
    if (this.datasets.bitcoin && this.datasets.bitcoin.length > 0) {
      this.datasets.bitcoin_yoy = this.calculateYoYReturns(
        this.datasets.bitcoin
      );
    }

    // Generate YoY returns for NASDAQ
    if (this.datasets.nasdaq && this.datasets.nasdaq.length > 0) {
      this.datasets.nasdaq_yoy = this.calculateYoYReturns(this.datasets.nasdaq);
    }
  }

  /**
   * Calculate year-over-year returns for a price dataset
   * @param {Array} priceData - Array of {date, value} objects
   * @returns {Array} Array of {date, value} objects where value is the YoY return
   */
  calculateYoYReturns(priceData) {
    const yoyReturns = [];

    for (let i = 0; i < priceData.length; i++) {
      const currentDate = priceData[i].date;
      const currentValue = priceData[i].value;

      // Find the data point from approximately one year ago (365 days)
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      // Find the closest data point to one year ago
      let closestIndex = -1;
      let minDiff = Number.MAX_VALUE;

      for (let j = 0; j < i; j++) {
        const diff = Math.abs(priceData[j].date - oneYearAgo);
        if (diff < minDiff) {
          minDiff = diff;
          closestIndex = j;
        }
      }

      // Calculate YoY return if we found a valid previous data point
      if (closestIndex !== -1) {
        const prevValue = priceData[closestIndex].value;
        const yoyReturn = (currentValue / prevValue - 1) * 100; // as percentage

        yoyReturns.push({
          date: currentDate,
          value: yoyReturn,
        });
      }
    }

    return yoyReturns;
  }

  /**
   * Get sample data if loading fails (for development/demo purposes)
   * @param {string} datasetName - The name of the dataset
   * @returns {Array} Sample dataset
   */
  getSampleData(datasetName) {
    console.warn(`Using sample data for ${datasetName}`);

    // Generate 30 years (360 months) of sample data
    const sampleData = [];
    const startDate = new Date("1992-01-01");

    for (let i = 0; i < 360; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);

      let value;

      switch (datasetName) {
        case "global_m2":
          // Growing trend with some fluctuations
          value = 1000 + i * 20 + (Math.random() - 0.5) * 200;
          break;

        case "ism_manufacturing":
        case "ism_services":
          // Fluctuating around 50 (expansion/contraction threshold)
          value = 50 + Math.sin(i / 24) * 10 + (Math.random() - 0.5) * 5;
          break;

        case "bitcoin":
          // Exponential growth in recent years
          if (i < 240) {
            // First 20 years (before Bitcoin existed)
            value = 0;
          } else {
            value =
              Math.pow(1.15, i - 240) * 100 + (Math.random() - 0.3) * 1000;
          }
          break;

        case "nasdaq":
          // Long-term growth with dot-com bubble and 2008 crash
          value = 500 + i * 10;
          if (i > 96 && i < 120) {
            // Dot-com bubble and crash
            value = value * (1.5 - Math.max(0, (i - 108) / 12));
          }
          if (i > 180 && i < 204) {
            // 2008 financial crisis
            value = value * (1 - Math.max(0, (i - 180) / 24) * 0.4);
          }
          // Add some random noise
          value = value + (Math.random() - 0.5) * (value * 0.05);
          break;

        case "spx":
          // Similar to NASDAQ but less volatile
          value = 400 + i * 5;
          if (i > 96 && i < 120) {
            // Dot-com bubble and crash
            value = value * (1.2 - Math.max(0, (i - 108) / 15));
          }
          if (i > 180 && i < 204) {
            // 2008 financial crisis
            value = value * (1 - Math.max(0, (i - 180) / 24) * 0.3);
          }
          // Add some random noise
          value = value + (Math.random() - 0.5) * (value * 0.03);
          break;

        default:
          value = Math.random() * 100;
      }

      sampleData.push({
        date: date,
        value: parseFloat(value.toFixed(2)),
      });
    }

    return sampleData;
  }

  /**
   * Filter a dataset by timeframe
   * @param {Array} dataset - The dataset to filter
   * @param {string} timeframe - One of: '1year', '5years', '10years', '20years', 'all'
   * @returns {Array} The filtered dataset
   */
  filterDatasetByTimeframe(dataset, timeframe) {
    if (!dataset || dataset.length === 0) {
      console.log("Empty dataset passed to filterDatasetByTimeframe");
      return [];
    }

    console.log(
      `Filtering dataset with ${dataset.length} items for timeframe: ${timeframe}`
    );

    // Convert string dates to Date objects if needed
    const processedDataset = dataset.map((item) => {
      return {
        date: item.date instanceof Date ? item.date : new Date(item.date),
        value: item.value,
      };
    });

    // Sort by date ascending
    processedDataset.sort((a, b) => a.date - b.date);

    // Current date to calculate relative timeframes
    const now = new Date();

    // Define cutoff date based on timeframe
    let cutoffDate;

    switch (timeframe) {
      case "1year":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case "5years":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 5);
        break;
      case "10years":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 10);
        break;
      case "20years":
        cutoffDate = new Date(now);
        cutoffDate.setFullYear(now.getFullYear() - 20);
        break;
      case "all":
      default:
        // Return the full dataset
        console.log("Returning full dataset (all timeframe)");
        return processedDataset;
    }

    console.log(
      `Cutoff date for timeframe ${timeframe}: ${cutoffDate.toISOString()}`
    );

    // Filter the dataset to only include entries after the cutoff date
    const filtered = processedDataset.filter((item) => item.date >= cutoffDate);

    console.log(
      `Filtered dataset has ${filtered.length} items (from ${dataset.length})`
    );

    return filtered;
  }

  /**
   * Get a dataset filtered by timeframe
   * @param {string} datasetName - The name of the dataset
   * @param {string} timeframe - One of: '1year', '5years', '10years', '20years', 'all'
   * @returns {Array|null} The filtered dataset or null if not found
   */
  getFilteredDataset(datasetName, timeframe = "all") {
    console.log(
      `Getting filtered dataset: ${datasetName}, timeframe: ${timeframe}`
    );
    const dataset = this.getDataset(datasetName);

    if (!dataset) {
      console.warn(`Dataset not found: ${datasetName}`);
      return null;
    }

    return this.filterDatasetByTimeframe(dataset, timeframe);
  }

  /**
   * Shift a dataset in time by a given number of months
   * @param {Array} dataset - Array of {date, value} objects
   * @param {number} months - Number of months to shift (positive = forward, negative = backward)
   * @returns {Array} Time-shifted dataset
   */
  shiftDataset(dataset, months) {
    if (!dataset || dataset.length === 0) {
      return [];
    }

    return dataset.map((item) => {
      const shiftedDate = new Date(item.date);
      shiftedDate.setMonth(shiftedDate.getMonth() + months);

      return {
        date: shiftedDate,
        value: item.value,
      };
    });
  }

  /**
   * Get a dataset by name
   * @param {string} datasetName - The name of the dataset
   * @returns {Array|null} The requested dataset or null if not found
   */
  getDataset(datasetName) {
    return this.datasets[datasetName] || null;
  }

  /**
   * Calculate correlation between two datasets
   * @param {Array} dataset1 - First dataset (array of {date, value} objects)
   * @param {Array} dataset2 - Second dataset (array of {date, value} objects)
   * @param {number} timeShift - Number of months to shift dataset2
   * @returns {number} Correlation coefficient (-1 to 1)
   */
  calculateCorrelation(dataset1, dataset2, timeShift = 0) {
    if (
      !dataset1 ||
      !dataset2 ||
      dataset1.length === 0 ||
      dataset2.length === 0
    ) {
      return 0;
    }

    // Shift the second dataset
    const shiftedDataset2 = this.shiftDataset(dataset2, timeShift);

    // Create arrays of matching date values
    const pairs = [];

    for (const d1 of dataset1) {
      // Find the closest date in shiftedDataset2
      let closest = null;
      let minDiff = Number.MAX_VALUE;

      for (const d2 of shiftedDataset2) {
        const diff = Math.abs(d1.date - d2.date);
        if (diff < minDiff) {
          minDiff = diff;
          closest = d2;
        }
      }

      // If the closest date is within 15 days, consider it a match
      if (closest && minDiff <= 15 * 24 * 60 * 60 * 1000) {
        pairs.push({
          x: d1.value,
          y: closest.value,
        });
      }
    }

    // Need at least 10 pairs to calculate meaningful correlation
    if (pairs.length < 10) {
      return 0;
    }

    // Calculate correlation coefficient
    const n = pairs.length;
    let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0,
      sumY2 = 0;

    for (const pair of pairs) {
      sumX += pair.x;
      sumY += pair.y;
      sumXY += pair.x * pair.y;
      sumX2 += pair.x * pair.x;
      sumY2 += pair.y * pair.y;
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  }
}

// Create a global instance of the DataLoader
const dataLoader = new DataLoader();
