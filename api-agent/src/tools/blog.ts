import { ChatOpenAI } from "@langchain/openai";
import { LMStudioUtils } from "../lib/lmstudio-utils";
import { config } from "../lib/config";

export class BlogTool {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: LMStudioUtils.getModelName(),
      temperature: config.llm.model.temperature.blog,
      openAIApiKey: config.llm.lmstudio.apiKey,
      configuration: {
        baseURL: `${config.llm.lmstudio.baseUrl}/v1`,
      },
    });
  }

  async createPost(topic: string, content?: string): Promise<any> {
    try {
      // Generate content if not provided
      let postContent = content;
      if (!postContent) {
        const response = await this.llm.invoke(`
        Write a comprehensive blog post about "${topic}". 
        The post should be:
        - 800-1200 words
        - SEO-optimized
        - Engaging and informative
        - Include relevant examples
        - Have a clear structure with headings
        
        Format the response as markdown.
        `);
        postContent = response.content as string;
      }

      // Generate title
      const titleResponse = await this.llm.invoke(`
      Generate an SEO-optimized title for a blog post about "${topic}". 
      The title should be:
      - 50-60 characters
      - Catchy and engaging
      - Include relevant keywords
      - Be click-worthy
      
      Return only the title, no quotes or extra text.
      `);

      const title = titleResponse.content as string;
      const slug = this.generateSlug(title);
      const excerpt = this.generateExcerpt(postContent);

      // Return the generated content (web app will handle database creation)
      return {
        title,
        slug,
        content: postContent,
        excerpt,
        status: "DRAFT",
      };
    } catch (error) {
      throw new Error(
        `Failed to generate blog post: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getPosts(status?: string): Promise<any[]> {
    try {
      const where = status ? { status: status.toUpperCase() as any } : {};

      const posts = await prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return posts;
    } catch (error) {
      throw new Error(
        `Failed to fetch posts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updatePost(postId: number, updates: any): Promise<any> {
    try {
      const post = await prisma.post.update({
        where: { id: postId },
        data: updates,
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return post;
    } catch (error) {
      throw new Error(
        `Failed to update post: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private generateExcerpt(content: string): string {
    // Extract first paragraph or first 150 characters
    const firstParagraph = content.split("\n\n")[0];
    if (firstParagraph.length <= 150) {
      return firstParagraph;
    }
    return firstParagraph.substring(0, 147) + "...";
  }
}
