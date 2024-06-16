﻿using minerobe.api.Entity;
using minerobe.api.Entity.Package;
using System.Text;

namespace minerobe.api.ResponseModel
{
    public class FileDataResponseModel
    {
        public string FileName { get; set; }
        public string Content { get; set; }
        public string Type { get; set; }
        public string Color { get; set; }
    }
    public static class FileDataResponseModelExtensions
    {
        public static FileDataResponseModel ToResponseModel(this FileData entity, bool toSnapshot = true)
        {
            return new FileDataResponseModel
            {
                FileName = entity.FileName,
                Content = toSnapshot ? Encoding.UTF8.GetString(entity.ContentSnapshot) : Encoding.UTF8.GetString(entity.Content),
                Type = entity.Type.ToString().ToLower(),
                Color = entity.Color
            };
        }
    }
}