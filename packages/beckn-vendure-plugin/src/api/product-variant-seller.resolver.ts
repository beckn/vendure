import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { QueryProductVariantsArgs } from '@vendure/common/lib/generated-types';
import {
    Allow,
    Ctx,
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
export class ProductVariantSellerResolver {
    constructor(private productVariantService: ProductVariantService) {}

    @Query()
    @Allow(Permission.Public)
    async getSellersOfProductVariants(
        @Ctx() ctx: RequestContext,
        @Args() args: QueryProductVariantsArgs,
        @Relations({ entity: ProductVariant, omit: ['assets'] }) relations: RelationPaths<ProductVariant>,
    ): Promise<PaginatedList<Translated<ProductVariant>>> {
        return this.productVariantService.findAll(ctx, args.options || undefined);
    }
}
