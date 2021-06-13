import { serialize } from "./serialize";
import { parse } from "./parse";
import defaultExtensions from './extensions';


export function createMarkdownEditor(Editor) {
    return class extends Editor {

        defaultMarkdownOptions = {
            html: true,
            tightLists: false,
            bulletListMarker: '*',
            extensions: defaultExtensions,
        }

        constructor(options) {
            super(options);
            const { setContent, insertContentAt } = this.commandManager.commands;
            this.commandManager.commands.setContent = (content, emitUpdate, parseOptions) => (props) => {
                return setContent(this.parseMarkdown(content), emitUpdate, parseOptions)(props);
            }
            this.commandManager.commands.insertContentAt = (range, content) => (props) => {
                return insertContentAt(range, this.parseMarkdown(content))(props);
            }
        }

        setOptions(options) {
            super.setOptions(options);
            this.options.markdown = {
                ...this.defaultMarkdownOptions,
                ...options?.markdown,
                extensions: [
                    ...this.defaultMarkdownOptions.extensions,
                    ...(options?.markdown?.extensions ?? []),
                ],
            }
        }

        get markdownExtensions() {
            return this.options.markdown.extensions;
        }

        createView() {
            const originalContent = this.options.content;
            this.options.content = this.parseMarkdown(this.options.content);

            super.createView();

            this.options.content = originalContent;
        }

        parseMarkdown(content) {
            const { html } = this.options.markdown;
            return parse(this.schema, content, {
                extensions: this.markdownExtensions,
                html,
            });
        }

        getMarkdown() {
            const { html, tightLists, bulletListMarker } = this.options.markdown;
            return serialize(this.schema, this.state.doc, {
                extensions: this.markdownExtensions,
                html,
                tightLists,
                bulletListMarker,
            });
        }
    }
}
