import chalk from 'chalk'
import path from 'path'
import { Command, Option } from 'clipanion'
import inquirer from 'inquirer'

import validateNpmName from '../utils/validateNpmName'
import { checkFileExists } from '../utils/checkFileExists'
import { copyDirectory } from '../utils/copyDirectory'
import { getQuestions, QuestionsAnswers } from '../services/Question'
import makeDirectory from 'make-dir'
import {
  getTemplate,
  commonTemplatesPath,
  getTemplates
} from '../services/Template'
import { Project } from '../services/Project'

const CURRENT_DIRECTORY = process.cwd()

export class CreateFullstackAppCommand extends Command {
  static usage = {
    description: 'Create Fullstack TypeScript application with ease.'
  }

  public directoryName = Option.String()

  public onlyWebsite = Option.Boolean('--only-website', false, {
    description: 'Generate only a website project.'
  })

  public onlyAPI = Option.Boolean('--only-api', false, {
    description: 'Generate only an API project.'
  })

  public noInstall = Option.Boolean('--no-install', false, {
    description:
      'It avoids the installation of npm packages inside `node_modules`.'
  })

  public github = Option.Boolean('--github', false, {
    description:
      'It creates a `.github` folder that contains issues templates, pull request templates and configurations for GitHub Actions.'
  })

  public templateAPI = Option.String('--template-api', {
    description: 'Choose the API template.'
  })

  public templateWebsite = Option.String('--template-website', {
    description: 'Choose the website template.'
  })

  async execute (): Promise<number> {
    if (this.onlyAPI && this.onlyWebsite) {
      this.context.stderr.write(
        `${chalk.red(
          'Error:'
        )} You can't set both "--only-api" and "--only-website" options.\n`
      )
      return 1
    }
    const validationDirectory = validateNpmName(this.directoryName)
    if (!validationDirectory.isValid) {
      this.context.stderr.write(
        `${chalk.red('Error:')} Invalid directory, ${
          validationDirectory.problem
        }\n`
      )
      return 1
    }
    const projectDirectory = path.join(CURRENT_DIRECTORY, this.directoryName)
    if (await checkFileExists(projectDirectory)) {
      this.context.stderr.write(
        `${chalk.red('Error:')} Could not create a project called "${this.directoryName}" because the folder name already exists...\n`
      )
      return 1
    }
    let answers: Partial<QuestionsAnswers> = {
      templateWebsite: this.templateWebsite,
      templateAPI: this.templateAPI
    }
    const templatesAvailable = await getTemplates()
    if (this.templateAPI == null && this.templateWebsite == null) {
      const questions = await getQuestions(this.onlyAPI, this.onlyWebsite)
      answers = (await inquirer.prompt(questions)) as QuestionsAnswers
    }
    if (this.onlyAPI) {
      if (answers.templateAPI == null) {
        this.context.stderr.write(
          `${chalk.red('Error:')} You didn't choose a template for the API.\n`
        )
        return 1
      }
      if (!templatesAvailable.api.includes(answers.templateAPI)) {
        this.context.stderr.write(
          `${chalk.red('Error:')} The template for the API doesn't exist.\n`
        )
        return 1
      }
    }
    if (this.onlyWebsite) {
      if (answers.templateWebsite == null) {
        this.context.stderr.write(
          `${chalk.red(
            'Error:'
          )} You didn't choose a template for the Website.\n`
        )
        return 1
      }
      if (!templatesAvailable.website.includes(answers.templateWebsite)) {
        this.context.stderr.write(
          `${chalk.red('Error:')} The template for the Website doesn't exist.\n`
        )
        return 1
      }
    }
    if (!this.onlyAPI && !this.onlyWebsite) {
      if (answers.templateAPI == null || answers.templateWebsite == null) {
        this.context.stderr.write(
          `${chalk.red(
            'Error:'
          )} You didn't choose a template for the Website or the API.\n`
        )
        return 1
      }
      if (!templatesAvailable.api.includes(answers.templateAPI)) {
        this.context.stderr.write(
          `${chalk.red('Error:')} The template for the API doesn't exist.\n`
        )
        return 1
      }
      if (!templatesAvailable.website.includes(answers.templateWebsite)) {
        this.context.stderr.write(
          `${chalk.red('Error:')} The template for the Website doesn't exist.\n`
        )
        return 1
      }
    }
    const answersDefinitive = answers as QuestionsAnswers
    this.context.stdout.write('\n')
    await makeDirectory(projectDirectory)
    await copyDirectory(commonTemplatesPath, projectDirectory)
    if (this.onlyAPI) {
      const templateAPI = await getTemplate({
        type: 'api',
        name: answersDefinitive.templateAPI
      })
      const projectAPI = new Project({
        template: templateAPI,
        projectPath: projectDirectory,
        noInstall: this.noInstall,
        shouldCreateGitHubFolder: this.github
      })
      await projectAPI.create()
    } else if (this.onlyWebsite) {
      const templateWebsite = await getTemplate({
        type: 'website',
        name: answersDefinitive.templateWebsite
      })
      const projectWebsite = new Project({
        template: templateWebsite,
        projectPath: projectDirectory,
        noInstall: this.noInstall,
        shouldCreateGitHubFolder: this.github
      })
      await projectWebsite.create()
    } else {
      const pathAPI = path.join(projectDirectory, 'api')
      const pathWebsite = path.join(projectDirectory, 'website')
      await makeDirectory(projectDirectory)
      const templateAPI = await getTemplate({
        type: 'api',
        name: answersDefinitive.templateAPI
      })
      const projectAPI = new Project({
        template: templateAPI,
        projectPath: pathAPI,
        noInstall: this.noInstall,
        shouldCreateGitHubFolder: this.github
      })
      const templateWebsite = await getTemplate({
        type: 'website',
        name: answersDefinitive.templateWebsite
      })
      const projectWebsite = new Project({
        template: templateWebsite,
        projectPath: pathWebsite,
        noInstall: this.noInstall,
        shouldCreateGitHubFolder: this.github
      })
      await projectWebsite.create()
      await projectAPI.create()
    }
    this.context.stdout.write(`${chalk.green('Success:')} created the new project at "${projectDirectory}"\n`)
    return 0
  }
}
