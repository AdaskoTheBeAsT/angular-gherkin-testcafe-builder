import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
  targetFromTargetString,
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { GherkinTestcafeBuilderOptions } from './schema';
import { isMatch } from 'lodash';
import createTestCafe from 'gherkin-testcafe';
import { CompilerOptions } from 'typescript';

// lack of proper typescript definition in testcafe hack
interface ExtendedRunOptions extends RunOptions {
  browserInitTimeout?: number;
  pageRequestTimeout?: number;
  ajaxRequestTimeout?: number;
  disableScreenshots?: boolean;
}

// lack of proper typescript definition in testcafe hack
interface ExtendedRunner extends Runner {
  compilerOptions(options: { typescript: CompilerOptions }): ExtendedRunner;
}

async function runnerRun(
  runner: ExtendedRunner,
  opts: GherkinTestcafeBuilderOptions
): Promise<number> {
  const runOptions: ExtendedRunOptions = {
    assertionTimeout: opts.assertionTimeout,
    debugMode: opts.debugMode,
    debugOnFail: opts.debugOnFail,
    disableTestSyntaxValidation: opts.disableTestSyntaxValidation,
    disablePageCaching: opts.disablePageCaching,
    pageLoadTimeout: opts.pageLoadTimeout,
    quarantineMode: opts.quarantineMode,
    selectorTimeout: opts.selectorTimeout,
    skipJsErrors: opts.skipJsErrors,
    skipUncaughtErrors: opts.skipUncaughtErrors,
    speed: opts.speed,
    stopOnFirstFail: opts.stopOnFirstFail,
    browserInitTimeout: opts.browserInitTimeout,
    pageRequestTimeout: opts.pageRequestTimeout,
    ajaxRequestTimeout: opts.ajaxRequestTimeout,
    disableScreenshots: opts.disableScreenshots,
  };
  return runner.run(runOptions);
}

async function runGherkinTestcafe(
  opts: GherkinTestcafeBuilderOptions,
  hostName
): Promise<number> {
  const proxy = opts.proxy;
  const proxyBypass = opts.proxyBypass;
  let optsSsl: TlsOptions = null;
  if (opts.ssl && opts.ssl.pfx) {
    optsSsl = opts.ssl;
  }

  const testCafe = await createTestCafe(
    hostName,
    opts.port1,
    opts.port2,
    optsSsl,
    opts.developmentMode
  );

  let runner = (
    opts.live ? testCafe.createLiveModeRunner() : testCafe.createRunner()
  ) as ExtendedRunner;

  if (opts.appCommand) {
    runner = runner.startApp(opts.appCommand, opts.appInitDelay);
  }

  if (opts.reporters) {
    if (typeof opts.reporters === 'string') {
      runner = runner.reporter(opts.reporters);
    } else if (opts.reporters instanceof Array) {
      runner = runner.reporter(opts.reporters);
    } else {
      runner = runner.reporter([opts.reporters]);
    }
  }

  if (opts.filter) {
    runner = runner.filter(
      (testName, fixtureName, fixturePath, testMeta, fixtureMeta) => {
        if (opts.filter.test && testName !== opts.filter.test) {
          return false;
        }

        if (
          opts.filter.testGrep &&
          !RegExp(opts.filter.testGrep).test(testName)
        ) {
          return false;
        }

        if (opts.filter.fixture && fixtureName !== opts.filter.fixture) {
          return false;
        }

        if (
          opts.filter.fixtureGrep &&
          !RegExp(opts.filter.fixtureGrep).test(fixtureName)
        ) {
          return false;
        }

        if (opts.filter.testMeta && !isMatch(testMeta, opts.filter.testMeta)) {
          return false;
        }

        return !(
          opts.filter.fixtureMeta &&
          !isMatch(fixtureMeta, opts.filter.fixtureMeta)
        );
      }
    );
  }

  runner = runner
    .useProxy(proxy, proxyBypass)
    .src(opts.src instanceof Array ? opts.src : [opts.src])
    .compilerOptions({
      typescript: {
        configPath: opts.tsConfigPath,
      },
    })
    .concurrency(opts.concurrency || 1);

  if (opts.clientScripts) {
    runner = runner.clientScripts(opts.clientScripts);
  }

  if (opts.screenshots) {
    runner = runner.screenshots(opts.screenshots);
  }

  if (opts.video) {
    runner = runner.video(
      opts.video.videoPath,
      opts.video.videoOptions,
      opts.video.videoEncodingOptions
    );
  }

  if (opts.browser) {
    runner = runner.browsers(opts.browser);
    return runnerRun(runner, opts);
  } else if (opts.browsers) {
    runner = runner.browsers(opts.browsers);
    return runnerRun(runner, opts);
  } else if (opts.remoteBrowser) {
    const remoteConnection = await testCafe.createBrowserConnection();

    // Outputs remoteConnection.url so that it can be visited from the remote browser.
    console.log(opts.remoteBrowser.url);
    runner = runner.browsers(remoteConnection);
    return new Promise<number>(
      (
        resolve: (value?: number | PromiseLike<number>) => void,
        reject: (reason?: any) => void
      ) => {
        remoteConnection.once('ready', async () => {
          try {
            const failedCount = await runnerRun(runner, opts);
            await testCafe.close();
            resolve(failedCount);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
  }

  throw new Error(
    'options.browser, options.browsers or options.remoteBrowser should be provided'
  );
}

async function execute(
  options: GherkinTestcafeBuilderOptions,
  context: BuilderContext
): Promise<BuilderOutput> {
  let server;
  let serverOptions;
  if (options.devServerTarget) {
    const target = targetFromTargetString(options.devServerTarget);
    serverOptions = await context.getTargetOptions(target);

    server = await context.scheduleTarget(target);
    const result = await server.result;
    if (!result.success) {
      console.log('SERVER.RESULT IS NOT SUCCESS!!!');
      return { success: false };
    }
  }

  try {
    const host = serverOptions ? serverOptions.host : options.host;
    const failedCount = await runGherkinTestcafe(options, host);
    if (failedCount > 0) {
      return { success: false };
    } else {
      return { success: true };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('Testcafe run failed!!! error:', e);
    return { success: false, error: e.message };
  } finally {
    if (server) {
      await server.stop();
    }
  }
}

export default createBuilder<JsonObject & GherkinTestcafeBuilderOptions>(
  execute
);
