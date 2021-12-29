export interface GherkinTestcafeBuilderOptions {
  ajaxRequestTimeout?: number;
  appCommand?: string;
  appInitDelay?: number;
  assertionTimeout?: number;
  browsers?: string | string[];
  browser?: Browser;
  browserInitTimeout?: number;
  remoteBrowser?: BrowserConnection;
  clientScripts?: ClientScript | ClientScript[]; //doesn't do anything yet
  color?: boolean;
  concurrency?: number;
  debugMode?: boolean;
  debugOnFail?: boolean;
  developmentMode?: boolean;
  devServerTarget?: string; // set to run ng serve
  disableMultipleWindows?: boolean;
  disablePageCaching?: boolean;
  disableScreenshots?: boolean;
  filter: Filter;
  host?: string; // default in schema.json
  live?: boolean; // default in schema.json
  noColor?: boolean;
  pageLoadTimeout?: number;
  pageRequestTimeout?: number;
  port1?: number;
  port2?: number;
  proxy?: string;
  proxyBypass?: string | string[];
  qrCode?: boolean;
  quarantineMode?: boolean;
  reporters?: string | Reporter | Reporter[]; // default in schema.json
  runExecutionTimeout?: number;
  screenshots?: ScreenshotsOptions;
  selectorTimeout?: number;
  skipJsErrors?: boolean;
  skipUncaughtErrors?: boolean;
  speed?: number;
  src: string | string[];
  ssl?: TlsOptions;
  stopOnFirstFail?: boolean;
  tags: string | string[];
  testExecutionTimeout?: number;
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
