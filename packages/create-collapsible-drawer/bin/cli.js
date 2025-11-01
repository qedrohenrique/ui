#!/usr/bin/env node

const path = require("path");
const fs = require("fs-extra");
const { execSync } = require("child_process");
const { Command } = require("commander");
const chalk = require("chalk");
const readline = require("readline");

async function run() {
  const program = new Command();
  program
    .name("create-collapsible-drawer")
    .description(
      "Install the CollapsibleDrawer component in your React/Next.js project"
    )
    .option("-p, --path <dir>", "project path", ".")
    .parse(process.argv);

  const opts = program.opts();
  const projectDir = path.resolve(process.cwd(), opts.path);
  const templateDir = path.resolve(__dirname, "../template");

  const globalsCssPath = path.join(projectDir, "src/app/globals.css");
  const globalsCssExists = fs.existsSync(globalsCssPath);

  console.log(chalk.cyan("📂  Copying component files..."));
  fs.copySync(templateDir, projectDir, {
    overwrite: false,
    errorOnExist: false,
  });
  console.log(chalk.green("✔  Files copied"));

  if (globalsCssExists) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = chalk.yellow(
      "⚠️  `src/app/globals.css` already exists. The component needs specific base styles from shadcn/ui. Without them, it might not look right. Do you want to overwrite your existing `globals.css`? (y/N) "
    );

    const answer = await new Promise((resolve) =>
      rl.question(question, resolve)
    );
    rl.close();

    if (answer.toLowerCase().trim() === "y") {
      const sourceGlobalsCss = path.join(templateDir, "src/app/globals.css");
      console.log(chalk.cyan("Overwriting `globals.css`..."));
      fs.copySync(sourceGlobalsCss, globalsCssPath, { overwrite: true });
      console.log(chalk.green("✔  `globals.css` overwritten."));
    } else {
      console.log(
        chalk.yellow(
          "Skipped overwriting `globals.css`. Please make sure it has the required shadcn/ui base styles."
        )
      );
    }
  }

  const componentsDirInTemplate = path.join(templateDir, "src", "components");
  const componentFiles = [];

  const walk = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
        componentFiles.push(path.relative(templateDir, fullPath));
      }
    }
  };

  if (fs.existsSync(componentsDirInTemplate)) {
    walk(componentsDirInTemplate);
  }

  const existingComponents = componentFiles.filter((relPath) =>
    fs.existsSync(path.join(projectDir, relPath))
  );

  if (existingComponents.length > 0) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = chalk.yellow(
      `⚠️  Os seguintes arquivos de componentes já existem e podem ser sobrescritos:\n${existingComponents
        .map((f) => ` - ${f}`)
        .join("\n")}\nDeseja sobrescrevê-los? (y/N) `
    );

    const answer = await new Promise((resolve) =>
      rl.question(question, resolve)
    );
    rl.close();

    if (answer.toLowerCase().trim() === "y") {
      existingComponents.forEach((relPath) => {
        const srcFile = path.join(templateDir, relPath);
        const destFile = path.join(projectDir, relPath);
        console.log(chalk.cyan(`Sobrescrevendo \`${relPath}\`...`));
        fs.copySync(srcFile, destFile, { overwrite: true });
      });
      console.log(chalk.green("✔  Arquivos de componentes sobrescritos."));
    } else {
      console.log(
        chalk.yellow(
          "Ignorando a sobrescrita dos componentes. Certifique-se de que suas versões estão atualizadas se necessário."
        )
      );
    }
  }

  const hasYarn = fs.existsSync(path.join(projectDir, "yarn.lock"));
  const hasPnpm = fs.existsSync(path.join(projectDir, "pnpm-lock.yaml"));
  let pm = "npm";
  if (hasPnpm) pm = "pnpm";
  else if (hasYarn) pm = "yarn";

  const deps = [
    "@radix-ui/react-separator",
    "@radix-ui/react-slot",
    "class-variance-authority",
    "clsx",
    "lucide-react",
    "motion",
    "tailwind-merge",
  ];

  console.log(chalk.cyan(`📦  Installing dependencies using ${pm}...`));

  try {
    if (pm === "npm") {
      execSync(`npm install ${deps.join(" ")}`, {
        cwd: projectDir,
        stdio: "inherit",
      });
    } else if (pm === "yarn") {
      execSync(`yarn add ${deps.join(" ")}`, {
        cwd: projectDir,
        stdio: "inherit",
      });
    } else {
      execSync(`pnpm add ${deps.join(" ")}`, {
        cwd: projectDir,
        stdio: "inherit",
      });
    }
  } catch (err) {
    console.error(chalk.red("Error installing dependencies."));
    console.error(err);
    process.exit(1);
  }

  console.log(
    chalk.bold.green("\n✅  CollapsibleDrawer installed successfully!")
  );
}

run().catch((e) => {
  console.error(chalk.red("An unexpected error occurred:"), e);
  process.exit(1);
});
