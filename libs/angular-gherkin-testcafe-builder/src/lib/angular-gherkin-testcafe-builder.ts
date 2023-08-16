import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
  targetFromTargetString,
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import createTestCafe from 'gherkin-testcafe';
import isMatch from 'lodash.ismatch';

import { GherkinTestcafeRunner } from './gherkin-testcafe-runner';
import { GherkinTestcafeBuilderOptions } from './schema';

async function runnerRun(
  runner: GherkinTestcafeRunner,
  opts: GherkinTestcafeBuilderOptions
): Promise<number> {
  const runOptions: Partial<RunOptions> = {
    assertionTimeout: opts.assertionTimeout,
    debugMode: opts.debugMode,
    debugOnFail: opts.debugOnFail,
    disableMultipleWindows: opts.disableMultipleWindows,
    disablePageCaching: opts.disablePageCaching,
    disableNativeAutomation: opts.disableNativeAutomation,
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
    testExecutionTimeout: opts.testExecutionTimeout,
    runExecutionTimeout: opts.runExecutionTimeout,
  };
  return runner.run(runOptions);
}

async function runGherkinTestcafe(
  opts: GherkinTestcafeBuilderOptions,
  hostName: string
): Promise<number> {
  const proxy = opts.proxy;
  const proxyBypass = opts.proxyBypass;
  let optsSsl: TlsOptions | undefined = undefined;
  if (opts.ssl?.pfx) {
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
  ) as GherkinTestcafeRunner;

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
      (
        testName: string,
        fixtureName: string,
        fixturePath: string,
        testMeta: Metadata,
        fixtureMeta: Metadata
      ): Promise<boolean> => {
        if (opts.filter.test && testName !== opts.filter.test) {
          return Promise.resolve(false);
        }

        if (
          opts.filter.testGrep &&
          !RegExp(opts.filter.testGrep).test(testName)
        ) {
          return Promise.resolve(false);
        }

        if (opts.filter.fixture && fixtureName !== opts.filter.fixture) {
          return Promise.resolve(false);
        }

        if (
          opts.filter.fixtureGrep &&
          !RegExp(opts.filter.fixtureGrep).test(fixtureName)
        ) {
          return Promise.resolve(false);
        }

        if (opts.filter.testMeta && !isMatch(testMeta, opts.filter.testMeta)) {
          return Promise.resolve(false);
        }

        return Promise.resolve(
          !(
            opts.filter.fixtureMeta &&
            !isMatch(fixtureMeta, opts.filter.fixtureMeta)
          )
        );
      }
    );
  }

  if (opts.tags) {
    runner = runner.tags(opts.tags instanceof Array ? opts.tags : [opts.tags]);
  }

  if (proxy) {
    runner = runner.useProxy(proxy, proxyBypass);
  }

  runner = runner
    .src(opts.src instanceof Array ? opts.src : [opts.src])
    .compilerOptions({
      typescript: {
        configPath: opts.tsConfigPath,
      },
    })
    .concurrency(opts.concurrency ?? 1);

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
        resolve: (value: number | PromiseLike<number>) => void,
        reject: (reason?: unknown) => void
      ): void => {
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
    const host = serverOptions
      ? (serverOptions['host'] as string)
      : options.host ?? 'localhost';
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
