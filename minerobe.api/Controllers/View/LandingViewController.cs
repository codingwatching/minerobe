﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using minerobe.api.Entity.Summary;
using minerobe.api.Helpers;
using minerobe.api.Helpers.Filter;
using minerobe.api.Helpers.Model;
using minerobe.api.ResponseModel.Package;
using minerobe.api.Services.Interface;
using minerobe.api.ServicesHelpers.Interface;

namespace minerobe.api.Controllers.View
{
    [AllowAnonymous]
    [Route("LandingView")]
    public class LandingViewController : Controller
    {
        private readonly ILandingViewService _landingViewService;
        private readonly IPackageService _packageService;
        private readonly IOutfitPackageServiceHelper _outfitPackageServiceHelper;
        private readonly IUserService _userService;
        public LandingViewController(ILandingViewService landingViewService, IPackageService packageService, IOutfitPackageServiceHelper outfitPackageServiceHelper, IUserService userService)
        {
            _packageService = packageService;
            _landingViewService = landingViewService;
            _userService = userService;
            _outfitPackageServiceHelper = outfitPackageServiceHelper;
        }
        [HttpPost("recent")]
        public async Task<IActionResult> GetMostRecent([FromBody] PagedOptions<SimpleFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var packages = await _landingViewService.GetMostRecent();
            var packagesPage = packages.Where(x => x.IsShared == true).ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitPackageServiceHelper.AddUserContextToPage(packagesPage, user?.Id);

            var mappedRespose = packagesPage.MapResponseOptions(items);
            return Ok(mappedRespose);
        }
        [HttpPost("liked")]
        public async Task<IActionResult> GetMostLiked([FromBody] PagedOptions<SimpleFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var packages = await _landingViewService.GetMostLiked();
            var packagesPage = packages.Where(x => x.IsShared == true).ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitPackageServiceHelper.AddUserContextToPage(packagesPage, user?.Id);

            var mappedRespose = packagesPage.MapResponseOptions(items);
            return Ok(mappedRespose);
        }
        [HttpPost("downloaded")]
        public async Task<IActionResult> GetMostDownloaded([FromBody] PagedOptions<SimpleFilter> options)
        {
            var user = await _userService.GetFromExternalUser(User);

            var packages = await _landingViewService.GetMostDownloaded();
            var packagesPage = packages.Where(x => x.IsShared == true).ToPagedResponse(options.Page, options.PageSize);

            var items = await _outfitPackageServiceHelper.AddUserContextToPage(packagesPage, user?.Id);

            var mappedRespose = packagesPage.MapResponseOptions(items);
            return Ok(mappedRespose);
        }
    }
}
