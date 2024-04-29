// Types
import type { CommandOptionsToCreateAnswerNames } from '../program';

export default abstract class CommandBase {
    constructor(public options?: CommandOptionsToCreateAnswerNames) {}
}
