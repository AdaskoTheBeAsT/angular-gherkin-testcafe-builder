export interface GherkinTestcafeBuilderOptions {
  appCommand?: string;
  appInitDelay?: number;
  assertionTimeout?: number;
  browsers?: string | string[];
  browser?: Browser;
  remoteBrowser?: BrowserConnection;
  clientScripts?: ClientScript | ClientScript[]; //doesn't do anything yet
  color?: boolean;
  concurrency?: number;
  debugMode?: boolean;
  debugOnFail?: boolean;
  developmentMode?: boolean;
  devServerTarget?: string; // set to run ng serve
  disablePageCaching?: boolean;
  disableScreenshots?: boolean;
  disableTestSyntaxValidation?: boolean;
  filter: Filter;
  host?: string; // default in schema.json
  live?: boolean; // default in schema.json
  noColor?: boolean;
  pageLoadTimeout?: number;
  port1?: number;
  port2?: number;
  proxy?: string;
  proxyBypass?: string | string[];
  qrCode?: boolean;
  quarantineMode?: boolean;
  reporters?: string | Reporter | Reporter[]; // default in schema.json
  screenshots?: ScreenshotsOptions;
  selectorTimeout?: number;
  skipJsErrors?: boolean;
  skipUncaughtErrors?: boolean;
  speed?: number;
  src: string | string[];
  ssl?: TlsOptions;
  stopOnFirstFail?: boolean;
  tsConfigPath?: string;
  video?: Video;
}

export interface Filter {
  fixture?: string;
  fixtureGrep?: string;
  fixtureMeta?: Record<string, string>;
  test?: string;
  testGrep?: string;
  testMeta?: Record<string, string>;
}

export interface Browser {
  path: string;
  cmd?: string;
}

export interface Reporter {
  name: string;
  output?: string;
}

export interface Video {
  videoPath: string;
  videoOptions?: VideoOptions;
  videoEncodingOptions?: VideoEncodingOptions;
}
