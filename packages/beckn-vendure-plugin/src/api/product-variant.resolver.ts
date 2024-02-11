import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { QueryProductVariantsArgs } from '@vendure/common/lib/generated-types';
import {
    Allow,
    Ctx,
    EntityHydrator,
    PaginatedList,
    Permission,
    ProductVariant,
    ProductVariantService,
    RelationPaths,
    Relations,
    RequestContext,
    Translated,
} from '@vendure/core';

@Resolver()
export class ProductVariantResolver {
    constructor(
        private productVariantService: ProductVariantService,
        private entityHydrator: EntityHydrator,
    ) {}

    @Query()
    @Allow(Permission.Public)
    async getProductVariantDetails(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryProductVariantsArgs,
        @Relations({ entity: ProductVariant, omit: ['assets'] }) relations: RelationPaths<ProductVariant>,
    ): Promise<PaginatedList<Translated<ProductVariant>>> {
        const productVariants = await this.productVariantService.findAll(ctx, args.options || undefined);
        for (const pv of productVariants.items) {
            await this.entityHydrator.hydrate(ctx, pv, {
                relations: ['options', 'options.group', 'product'],
            });
        }
        return productVariants;
    }
}
